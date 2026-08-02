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

    this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        500,
        900,
        0xe8f5ff
    );

    this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "🏒\nRink Coming Soon",
        {
            font: "34px Arial",
            align: "center",
            fill: "#000000"
        }
    ).setOrigin(0.5);
}