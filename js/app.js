import SlotsGame from "./SlotsGame.js";

PIXI.loader
    .add("Q", "./assets/images/Q.png")
    .add("M6", "./assets/images/M6.png")
    .add("M5", "./assets/images/M5.png")
    .add("M4", "./assets/images/M4.png")
    .add("M3", "./assets/images/M3.png")
    .add("M2", "./assets/images/M2.png")
    .add("M1", "./assets/images/M1.png")
    .add("K", "./assets/images/K.png")
    .add("J", "./assets/images/J.png")
    .add("H6", "./assets/images/H6.png")
    .add("H5", "./assets/images/H5.png")
    .add("H4", "./assets/images/H4.png")
    .add("H3", "./assets/images/H3.png")
    .add("H2", "./assets/images/H2.png")
    .add("H1", "./assets/images/H1.png")
    .add("BONUS", "./assets/images/BONUS.png")
    .add("A", "./assets/images/A.png")
    .add("10", "./assets/images/10.png")
    .add("9", "./assets/images/9.png")
    .add("buttonActive", "./assets/images/BTN_Spin_active.png")
    .add("buttonDeactivated", "./assets/images/BTN_Spin_deactivated.png")
    .add("coins", "./assets/images/coin.png")
    .add("yellowBar", "./assets/images/leftArrow.png")
    .add("blueBar", "./assets/images/rightArrow.png")
    .load(onAssetsLoaded);


//onAssetsLoaded handler builds the example.
function onAssetsLoaded() {
    let game = new SlotsGame();
}
