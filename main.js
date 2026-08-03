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
const rinkGraphics = this.add.graphics();

rinkGraphics.fillStyle(0xf4fbff, 1);
rinkGraphics.fillRoundedRect(
    this.cameras.main.centerX - 165,
    this.cameras.main.centerY - 305,
    330,
    610,
    55
);

rinkGraphics.lineStyle(4, 0x1d5fa7, 1);
rinkGraphics.strokeRoundedRect(
    this.cameras.main.centerX - 165,
    this.cameras.main.centerY - 305,
    330,
    610,
    55
);
this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    330,
    4,
    0xff0000
    );
    this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 150,
    330,
    4,
    0x1d5fa7
);
this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY + 150,
    330,
    4,
    0x1d5fa7
);
rinkGraphics.lineStyle(4, 0x4fc3ff, 1);

rinkGraphics.strokeCircle(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    42
);
rinkGraphics.fillStyle(0x4fc3ff, 1);

rinkGraphics.fillCircle(
    this.cameras.main.centerX - 95,
    this.cameras.main.centerY,
    4
);

rinkGraphics.fillCircle(
    this.cameras.main.centerX + 95,
    this.cameras.main.centerY,
    4
);
rinkGraphics.lineStyle(3, 0xff3b30, 1);

rinkGraphics.strokeCircle(
    this.cameras.main.centerX - 85,
    this.cameras.main.centerY - 225,
    34
);

rinkGraphics.strokeCircle(
    this.cameras.main.centerX + 85,
    this.cameras.main.centerY - 225,
    34
);

rinkGraphics.strokeCircle(
    this.cameras.main.centerX - 85,
    this.cameras.main.centerY + 225,
    34
);

rinkGraphics.strokeCircle(
    this.cameras.main.centerX + 85,
    this.cameras.main.centerY + 225,
    34
);
rinkGraphics.lineStyle(3, 0x4fc3ff, 1);

rinkGraphics.strokeEllipse(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 235,
    80,
    70
);

rinkGraphics.strokeEllipse(
    this.cameras.main.centerX,
this.cameras.main.centerY + 235,
    80,
    70
);
rinkGraphics.fillStyle(0xff3b30, 1);
rinkGraphics.fillRect(
    this.cameras.main.centerX - 18,
    this.cameras.main.centerY - 302,
    36,
    4
);

rinkGraphics.fillRect(
    this.cameras.main.centerX - 18,
    this.cameras.main.centerY + 298,
    36,
    4
);

rinkGraphics.fillCircle(
    this.cameras.main.centerX - 18,
    this.cameras.main.centerY - 300,
    5
);

rinkGraphics.fillCircle(
    this.cameras.main.centerX + 18,
    this.cameras.main.centerY - 300,
    5
);

rinkGraphics.fillCircle(
    this.cameras.main.centerX - 18,
    this.cameras.main.centerY + 300,
    5
);

rinkGraphics.fillCircle(
    this.cameras.main.centerX + 18,
    this.cameras.main.centerY + 300,
    5
);
rinkGraphics.lineStyle(3, 0xff3b30, 1);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 165,
    this.cameras.main.centerY - 28,
    this.cameras.main.centerX + 154,
    this.cameras.main.centerY - 26
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 154,
    this.cameras.main.centerY - 26,
    this.cameras.main.centerX + 145,
    this.cameras.main.centerY - 20
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 145,
    this.cameras.main.centerY - 20,
    this.cameras.main.centerX + 139,
    this.cameras.main.centerY - 11
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 139,
    this.cameras.main.centerY - 11,
    this.cameras.main.centerX + 137,
    this.cameras.main.centerY
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 137,
    this.cameras.main.centerY,
    this.cameras.main.centerX + 139,
    this.cameras.main.centerY + 11
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 139,
    this.cameras.main.centerY + 11,
    this.cameras.main.centerX + 145,
    this.cameras.main.centerY + 20
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 145,
    this.cameras.main.centerY + 20,
    this.cameras.main.centerX + 154,
    this.cameras.main.centerY + 26
);

rinkGraphics.lineBetween(
    this.cameras.main.centerX + 154,
    this.cameras.main.centerY + 26,
    this.cameras.main.centerX + 165,
    this.cameras.main.centerY + 28
);
});


}