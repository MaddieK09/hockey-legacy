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

const titleText = this.add.text(
        this.cameras.main.centerX,
        80,
        "HOCKEY LEGACY",
        {
            font: "40px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

const versionText = this.add.text(
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
titleText.setVisible(false);
versionText.setVisible(false);
this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    330,
    610,
    0xf4fbff
).setStrokeStyle(4, 0x1d5fa7);
this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    6,
    620,
    0xff0000
);
});


}