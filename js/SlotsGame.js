import Resources from "./resources.js";
import UIResources from "./uiResources.js";

export default class SlotsGame {

    playerResources;
    uiResources;
    payTable;
    spinning;

    constructor() {
        this.playerResources = new Resources();
        
        this.spinning = false;
        this.isGameOver = false;

        this.payTable = {
            Q: [5, 10, 25],
            A: [5, 10, 25],
            K: [5, 10, 25],
            J: [5, 10, 25],
            H1: [5, 10, 25],
            H2: [5, 10, 25],
            H3: [25, 60, 120],
            H4: [7, 15, 40],
            H5: [8, 20, 50],
            H6: [10, 25, 60],
            BONUS: [50, 200, 250],
            M1: [1, 3, 5],
            M2: [1, 3, 5],
            M3: [1, 3, 5],
            M4: [1, 3, 5],
            M5: [1, 3, 5],
            9: [1, 3, 5],
            10: [1, 3, 5],
        };

        // Init UI
        this.uiResources = new UIResources("PLACE YOUR BET", 5, 3, this.playerResources);

        // Event listeners for UI buttons
        // Check for event on click on rightArrow button and call AddStake function
        this.uiResources.rightArrow.addListener("pointerdown", () => this.increaseStakes());

        // Check for event on click on leftArrow button and call MinusStake function
        this.uiResources.leftArrow.addListener("pointerdown", () => this.reduceStakes());

        // Check for event on spin button
        this.uiResources.buttonActive.addListener('pointerdown', () => this.spinRound());

        // Check for event on new game button
        this.uiResources.repeatButton.addListener("pointerdown", () => this.restartGame());
    }

    // Spin Action logic
    spinRound = () => {
        // If solts are spinning or game is over cannot place bet
        if(this.spinning || this.isGameOver) return;
        // If balance is bigger than remaining amount, auto-reduce stakes to max value possible
        while(this.playerResources.balance < this.playerResources.stake) this.reduceStakes();
        
        this.startPlay();
        // Reduce balance on click depending on bet amount
        this.playerResources.reduceBalance();
        this.uiResources.changeUIText(this.playerResources.balance, this.uiResources.balanceText);
    }

    // Restarts game UI and player values
    restartGame = () => {
        this.uiResources.app.destroy();
        this.playerResources = new Resources();
        this.uiResources = new UIResources("PLACE YOUR BET", 5, 3, this.playerResources);
        this.isGameOver = false;
    }

    // Function to start
    // Moves reels and calls tweening from UI
    startPlay = () => {
        if (this.spinning || this.isGameOver) return;
        this.uiResources.changeUIText("SPINNING ...", this.uiResources.headerText);
        this.spinning = true;
        this.resetWin();

        for (let i = 0; i < this.uiResources.reels.length; i++) {
            const r = this.uiResources.reels[i];
            const extra = Math.floor(Math.random() * 3);
            this.uiResources.tweenTo(
                r,
                "position",
                r.position + 10 + i * 5 + extra,
                2500 + i * 600 + extra * 600,
                this.backout(0.6),
                null,
                i == this.uiResources.reels.length - 1 ? this.reelsComplete : null
            );
        }
    }

    // Reels done handler.
    reelsComplete = () => {
        this.spinning = false;
        this.checkWin();
    }

    // Decreases stake in player resources and updates text
    reduceStakes() {
        this.playerResources.minusStake();
        this.uiResources.footerContainer.addChild(this.uiResources.stackText);
        //update  PIXI text on screen
        this.uiResources.changeUIText(this.playerResources.stake, this.uiResources.stackText);
    };

    // Increases stake in player resources and updates text
    increaseStakes() {
        this.playerResources.addStake();
        // pdate  PIXI stack text on screen
        this.uiResources.changeUIText(this.playerResources.stake, this.uiResources.stackText);
    }

    // Checks the winning combos in the resulting matrix after roll
    // Sums all wins and updates balances if needed
    // Checks if game over
    checkWin() {
        // Getting the resulting sprites in Array
        const resultMatrix = this.getResultMatrix();
        const winningCombos = this.checkCombos(resultMatrix);
        // Reduce winning combos array into payTable values with combo lookup
        // Sums all values for each payline into total won
        const winAmount = winningCombos.reduce((sum, combo) => sum + this.payTable[combo[0]][combo[1] - 3], 0);

        // If amount won is bigger than 0 update balance and win texts
        if(winAmount > 0) {
            // Update balance and screenText
            this.playerResources.addBalance(winAmount);
            this.uiResources.changeUIText(this.playerResources.balance, this.uiResources.balanceText);
            this.uiResources.changeUIText(`+${this.playerResources.win}`, this.uiResources.winText);
        }

        // Check for gameOver
        if(this.playerResources.balance <= 0) {
            this.uiResources.changeUIText(" GAME OVER !", this.uiResources.headerText);
            this.isGameOver = true;
            return;
        }
        this.uiResources.changeUIText("PLACE YOUR BET", this.uiResources.headerText);
    };

    // Converts Sprite texture matrix to 3 x 5 array of tile names
    // Detection based on collision function but there might be a better way to do this
    getResultMatrix() {
        let resultMatrix = [[], [], []];
        for (let i = 0; i < this.uiResources.reels.length; i++) {
            const r = this.uiResources.reels[i];
            for(let n = 0; n < r.symbols.length; n++) {
                const collides = this.collisionResponse(r.symbols[n], this.uiResources.mid);
                if(collides !== undefined)
                    resultMatrix[collides].push(r.symbols[n].texture.textureCacheIds[0].split("/").pop().replace('.png', ''));
            }
        }
        return resultMatrix;
    };

    // Loops through each payline contents and reduce to array of key and value objects
    // Only keeps counts until it reaches a different symbol since pay is left to right
    // Then filters array to keep only the leftmost combo value
    // Map the filtered key/value to [key, value]
    checkCombos(resultMatrix) {
        console.log("matrix lines: ", resultMatrix);
        let paylines = [
            [ // Top Line
                resultMatrix[0][0],
                resultMatrix[0][1],
                resultMatrix[0][2],
                resultMatrix[0][3],
                resultMatrix[0][4]
            ],
            [ // Middle Line
                resultMatrix[1][0],
                resultMatrix[1][1],
                resultMatrix[1][2],
                resultMatrix[1][3],
                resultMatrix[1][4]
            ],
            [ // Bottom Line
                resultMatrix[2][0],
                resultMatrix[2][1],
                resultMatrix[2][2],
                resultMatrix[2][3],
                resultMatrix[2][4]
            ],
            [  // TL-BR Diagonal Line
                resultMatrix[0][0],
                resultMatrix[1][1],
                resultMatrix[1][2],
                resultMatrix[2][3],
                resultMatrix[2][4]
            ],
            [ // BL-TR Diagonal Line
                resultMatrix[2][0],
                resultMatrix[1][1],
                resultMatrix[1][2],
                resultMatrix[0][3],
                resultMatrix[0][4]
            ],
            [ // TL-BC-TR V Line
                resultMatrix[0][0],
                resultMatrix[1][1],
                resultMatrix[2][2],
                resultMatrix[1][3],
                resultMatrix[0][4]
            ],
            [ // BL-TC-BR V Line
                resultMatrix[2][0],
                resultMatrix[1][1],
                resultMatrix[0][2],
                resultMatrix[1][3],
                resultMatrix[2][4]
            ]
        ];

        return paylines.reduce((counts, line) => {

            const countResult =  line.reduce((count, slt, sltId) => {
                if(Object.keys(count).length > 1) return count;
                if(!count[slt]) count[slt] = 1;
                else if(line[0] == slt) count[slt]++;

                return count;
            }, {});
            counts.push(countResult);

            return counts;
        }, []).filter(line => Object.keys(line).filter(key => line[key] > 2).length > 0)
                    .map(filteredLine => [Object.keys(filteredLine)[0], Object.values(filteredLine)[0]]);
    }

    // Sets player win balance to 0 and updates text
    resetWin() {
        this.playerResources.win = 0;
        this.uiResources.changeUIText(this.playerResources.win, this.uiResources.winText);
    }
    
    // Collision function of objects with bounds relative to each other
    // Margins of collision adjusted to better detect based on inexactitudes with y coord
    collisionResponse(objA, objB) {
        const aBox = objA.getBounds();
        const bBox = objB.getBounds();
        // console.log("a: ", aBox.x, aBox.y);
        // console.log("b: ", bBox.x, bBox.y);
        // console.log(aBox.y - bBox.y );
        
        if (aBox.y - bBox.y < 20 && aBox.y - bBox.y > -20) return 1 // middle
        if (aBox.y - bBox.y <= -50) return 0; // top
        if (aBox.y - bBox.y >= 50) return 2; // bottom
    }

    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    backout = (amount) => (t) => --t * t * ((amount + 1) * t + amount) + 1;

}