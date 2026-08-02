const config = {
    type: Phaser.AUTO,

    parent: "game",

    width: window.innerWidth,

    height: window.innerHeight,

    backgroundColor: "#0d7a2b",

    scene: {
        create: create
    }
};

const game = new Phaser.Game(config);

function create() {

    this.add.text(
        this.cameras.main.centerX,
        80,
        "HOCKEY LEGACY",
        {
            font: "40px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    this.add.text(
        this.cameras.main.centerX,
        170,
        "Version 0.0.1",
        {
            font: "24px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);
const playButton = this.add.text(
    this.cameras.main.centerX,
    300,
    "▶ PLAY",
    {
        font: "36px Arial",
        fill: "#ffff00"
    }
).setOrigin(0.5).setInteractive();
playButton.on("pointerdown", () => {

    this.cameras.main.setBackgroundColor("#d8f0ff");

    playButton.setVisible(false);

});


}