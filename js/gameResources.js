import Resources from "./resources.js";
import UIResources from "./uiResources.js";

export default class GameResources {

    playerResources;
    uiResources;
    paytable;
    running;

    constructor() {
        this.playerResources = new Resources();
        this.uiResources = new UIResources("Carlitoslots", 5, 3);
        this.isGameOver = false;

        this.paytable = {
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
        };

        this.running = false;
    }

    // Initializes UI - TODO: break down into smaller more manageable code
    init = () => {
        // Init UI
        this.uiResources.init(this.playerResources);

        //check for event on click on rightArrow button and call AddStake function
        this.uiResources.rightArrow.addListener("pointerdown", () => this.increaseStakes());

        //check for event on click on leftArrow button and call MinusStake function
        this.uiResources.leftArrow.addListener("pointerdown", () => this.reduceStakes());

        //check for event on spin button
        this.uiResources.buttonActive.addListener('pointerdown', () => {
            this.spinRound();
        });

        this.uiResources.repeatButton.addListener("pointerdown", () => {
            this.restartGame();
        });

        this.uiResources.app.ticker.add(this.uiResources.reelAnimateUpdate);
    };

    spinRound = () => {
        console.log("spinROund");
        if(this.running || this.isGameOver) return;
        this.startPlay();
        //Reduce balance on click depending on bet amount
        this.playerResources.reduceBalance();
        this.uiResources.balanceText.text = this.playerResources.balance;
    }


    restartGame = () => {
        console.log("repeat");
        this.uiResources.app.destroy();
        this.uiResources = new UIResources("Carlitoslots", 5, 3);
        this.playerResources = new Resources();
        this.init();
    }

    //Function to start playing.
    startPlay = () => {
        if (this.running || this.isGameOver) return;
        this.running = true;
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

    //Reels done handler.
    reelsComplete = () => {
        this.running = false;
        this.checkWin();
        console.log(this.uiResources.app.stage.children);
    }

    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    backout(amount) {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
    };

    // Decreases stake in player resources and updates text
    reduceStakes() {
        this.playerResources.minusStake();
        this.uiResources.footerContainer.addChild(this.uiResources.stackText);
        //update  PIXI text on screen
        this.uiResources.stackText.text = this.playerResources.stake;
    };

    // Increases stake in player resources and updates text
    increaseStakes() {
        this.playerResources.addStake();
        // pdate  PIXI stack text on screen
        this.uiResources.stackText.text = this.playerResources.stake;
    }

    // Checks the winning combos in the resulting matrix after roll
    // Sums all wins and updates balances if needed
    // Checks if game over
    checkWin() {
        // Getting the resulting sprites in Array
        const resultMatrix = this.getResultMatrix();
        // console.log(resultMatrix);

        const winningCombos = this.checkCombos(resultMatrix);

        // Reduce winningcombos array into paytable values with combo lookup
        const wins = winningCombos.reduce((sum, combo) => sum + this.paytable[combo[0]][combo[1] - 3], 0);
        // console.log(winningCombos);
        // console.log(wins);

        if(wins > 0) {
            // Update balance and screenText
            this.playerResources.addBalance(wins);
            this.uiResources.balanceText.text = this.playerResources.balance;
            this.uiResources.winText.text = `+${this.playerResources.win}`;
        }

        // Check for gameOver
        if(this.playerResources.balance <= 0) {
            this.uiResources.headerText.text = "GAME OVER!";
            this.isGameOver = true;
        }
    };

    // Converts Sprite texture matrix to 3 x 5 array of tile names
    // Detection based on collision function but there might be a better way to do this
    getResultMatrix() {
        let resultMatrix = [[], [], []];
        for (let i = 0; i < this.uiResources.reels.length; i++) {
            const r = this.uiResources.reels[i];
            for(let n = 0; n < r.symbols.length; n++) {
                const collides = this.collisionResponse(r.symbols[n], this.uiResources.mid);
                // console.log(collides, r.symbols[n].texture.textureCacheIds[0].split("/").pop().replace('.png', ''));
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
        console.log(resultMatrix);
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
                resultMatrix[0][1],
                resultMatrix[1][2],
                resultMatrix[2][3],
                resultMatrix[2][4]
            ],
            [ // BL-TR Diagonal Line
                resultMatrix[2][0],
                resultMatrix[2][1],
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
        this.uiResources.winText.text = this.playerResources.win;
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
}