export default class UIResources {


    footerContainer;
    buttonsHolder;
    leftArrow;
    rightArrow;
    buttonActive;
    repeatButton;
    reelContainer;
    reels;
    mid;
    slotTextures;
    app;
    style;
    headerText;
    stackText;
    winText;
    balanceText;
    title;
    columns;
    rows;
    REEL_WIDTH;
    SYMBOL_SIZE;
    MARGIN;
    tweening;

    constructor(title, columns, rows, playerResources) {
        
        this.slotTextures = [
            PIXI.Texture.fromImage("./assets/images/Q.png"),
            PIXI.Texture.fromImage("./assets/images/M5.png"),
            PIXI.Texture.fromImage("./assets/images/M4.png"),
            PIXI.Texture.fromImage("./assets/images/M3.png"),
            PIXI.Texture.fromImage("./assets/images/M2.png"),
            PIXI.Texture.fromImage("./assets/images/M1.png"),
            PIXI.Texture.fromImage("./assets/images/K.png"),
            PIXI.Texture.fromImage("./assets/images/J.png"),
            PIXI.Texture.fromImage("./assets/images/H6.png"),
            PIXI.Texture.fromImage("./assets/images/H5.png"),
            PIXI.Texture.fromImage("./assets/images/H4.png"),
            PIXI.Texture.fromImage("./assets/images/H3.png"),
            PIXI.Texture.fromImage("./assets/images/H2.png"),
            PIXI.Texture.fromImage("./assets/images/H1.png"),
            PIXI.Texture.fromImage("./assets/images/BONUS.png"),
            PIXI.Texture.fromImage("./assets/images/A.png"),
            PIXI.Texture.fromImage("./assets/images/10.png"),
            PIXI.Texture.fromImage("./assets/images/9.png")
        ];

        this.app = new PIXI.Application(640, 360, {
            transparent: true,
            autoResize: true,
            antialias: true,
            resolution: 1
        });

        this.style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: ['#ffffff', '#daa520'], // gradient
            stroke: '#4a1850',
            strokeThickness: 6,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 300
        });

        this.tweening = [];

        this.reels= [];

        this.title = title;
        this.columns = columns;
        this.rows = rows;

        document.body.appendChild(this.app.view);
        // Initializes UI - TODO: break down into smaller more manageable code

        this.REEL_WIDTH = 90;
        this.SYMBOL_SIZE = 80;
        this.MARGIN = 50;

        let graphicsOne = this.makeGraphicsArea(0xdaa520, 100, 295, 100);
        let graphicsTwo = this.makeGraphicsArea(0xdaa520, 360, 295, 50);

        let winLabel = new PIXI.Text('WIN', this.style);
        let stakeLabel = new PIXI.Text('STAKE', this.style);

        let coins = new PIXI.Sprite.fromImage("./assets/images/coin.png");
        coins.x = this.app.screen.width - 150;
        coins.y = 2;
        coins.scale.x *= 0.08;
        coins.scale.y *= 0.08;

        this.buttonsHolder = new PIXI.Container();
        this.buttonsHolder.x = 0;
        this.buttonsHolder.y = 0;

        this.leftArrow = this.makeImageButton(
            './assets/images/leftArrow.png',
            330,
            295,
            0.05
        );

        this.rightArrow = this.makeImageButton(
            './assets/images/rightArrow.png',
            410,
            295,
            0.05
        );

        this.buttonActive = this.makeImageButton(
            './assets/images/spin.png',
            490,
            235,
            0.2
        );

        this.repeatButton = this.makeImageButton(
            './assets/images/BTN_Spin_active.png',
            220,
            295,
            0.90
        );

        this.repeatButton.x = 20;
        this.repeatButton.y = 10;
        this.repeatButton.scale.x *= 0.48;
        this.repeatButton.scale.y *= 0.48;

        this.reelContainer = new PIXI.Container();
        this.makeReels();

        this.reelContainer.y = this.MARGIN * 2.8;
        this.reelContainer.x = 100;

        let top = new PIXI.Graphics();
        top.beginFill(0, 1);
        top.drawRect(0, 0, this.app.screen.width, this.MARGIN);

        let bottom = new PIXI.Graphics();
        bottom.beginFill(0, 1);
        bottom.drawRect(0, 240 + this.MARGIN, this.app.screen.width, this.MARGIN);

        this.mid = new PIXI.Sprite.fromImage('./assets/images/bar.png');
        this.mid.x = 0;
        this.mid.y = (this.reelContainer.height)/2 + 20;
        this.mid.width = this.app.screen.width;
        this.mid.height = this.SYMBOL_SIZE;

        this.headerText = new PIXI.Text(this.title, this.style);
        this.headerText.x = Math.round((top.width - this.headerText.width) / 2);
        this.headerText.y = Math.round((this.MARGIN - this.headerText.height) / 2);

        this.stackText = new PIXI.Text(`${playerResources.stake}`, this.style);
        this.stackText.x = 375;
        this.stackText.y = 295;

        this.winText = new PIXI.Text(`${playerResources.win}`, this.style);
        this.winText.x = 120;
        this.winText.y = 295;

        winLabel.x = 30;
        winLabel.y = 295;

        stakeLabel.x = 220;
        stakeLabel.y = 295;

        this.balanceText = new PIXI.Text(`${playerResources.balance}`, this.style);
        this.balanceText.x = 535;
        this.balanceText.y = 5;

        this.footerContainer = new PIXI.Container();
        this.footerContainer.x = 0;
        this.footerContainer.y = 20;

        //Build the reels
        this.app.stage.addChild(this.reelContainer);

        //Build top & bottom covers and position reelContainer
        //Add header text
        top.addChild(this.headerText);

        //Stack Selector Text between arrow buttons
        this.footerContainer.addChild(this.stackText);
        //Add win text to the canvas
        this.footerContainer.addChild(this.winText);
        //Add balance text to the canvas
        top.addChild(this.balanceText);

        this.app.stage.addChild(top);
        this.app.stage.addChild(coins);
        this.app.stage.addChild(this.repeatButton);
        this.app.stage.addChild(this.footerContainer);
        this.app.stage.addChild(this.mid);
        this.footerContainer.addChild(
            bottom,
            winLabel,
            stakeLabel,
            graphicsOne,
            graphicsTwo,
            this.buttonsHolder,
            this.buttonActive,
            this.stackText,
            this.winText);
        
        // Listen for animate update.
        this.app.ticker.add(this.appAnimateUpdate);
        this.app.ticker.add(this.reelAnimateUpdate);
    };

    changeUIText = (str, obj) => obj.text = str;

    // Creates Image button and adds to buttonsHolder
    makeImageButton = (image, x, y, scale) => {
        const button = PIXI.Sprite.fromImage(image);
        button.interactive = true;
        button.buttonMode = true;
        this.buttonsHolder.addChild(button);
        button.x = x;
        button.y = y;
        button.scale.set(scale);
        return button;
    };

    makeGraphicsArea = (color, x, y, width) => {
        const graphicsArea = new PIXI.Graphics();
        graphicsArea.lineStyle(2, color, 1);
        graphicsArea.beginFill(0xFF00BB, 0.25);
        graphicsArea.drawRoundedRect(x, y, width, 35, 15);
        graphicsArea.endFill();

        return graphicsArea;
    };

    makeReels = () => {
        // Create reels
        for (let i = 0; i < this.columns; i++) {
            const rc = new PIXI.Container();
            rc.x = i * this.REEL_WIDTH;
            this.reelContainer.addChild(rc);
    
            let reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter()
            };
    
            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            rc.filters = [reel.blur];
    
            //Build the randomized symbols
            for (let j = 0; j < this.rows; j++) {
                const texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
                const symbol = new PIXI.Sprite(texture);
                //Scale the symbol to fit symbol area.
                symbol.y = j * this.SYMBOL_SIZE;
                symbol.scale.x = symbol.scale.y = Math.min(this.SYMBOL_SIZE / symbol.width, this.SYMBOL_SIZE / symbol.height);
                symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 9);
                reel.symbols.push(symbol);
                rc.addChild(symbol);
            }
            this.reels.push(reel);
        }
    };

    reelAnimateUpdate = (delta) => {
        //Update the slots.
        for (const r of this.reels) {
            //Update blur filter y amount based on speed.
            //This would be better if calculated with time in mind also. Now blur depends on frame rate.
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;
    
            //Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = (r.position + j) % r.symbols.length * this.SYMBOL_SIZE - this.SYMBOL_SIZE;
                if (s.y < 0 && prevy > this.SYMBOL_SIZE) {
                    //Detect going over and swap a texture.
                    //This should in proper product be determined from some logical reel.
                    s.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(this.SYMBOL_SIZE / s.texture.width, this.SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((this.SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    };

    appAnimateUpdate = (delta) => {
        const now = Date.now();
        const remove = [];
        for (var i = 0; i < this.tweening.length; i++) {
            const t = this.tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);
    
            t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase == 1) {
                t.object[t.property] = t.target;
                if (t.complete)
                    t.complete(t);
                remove.push(t);
            }
        }
        for (var i = 0; i < remove.length; i++) {
            this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
        }
    }

    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    tweenTo = (object, property, target, time, easing, onchange, oncomplete) => {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now()
        };

        this.tweening.push(tween);
        return tween;
    };

    // lerp funtion.
    lerp = (a1, a2, t) => a1 * (1 - t) + a2 * t;
}