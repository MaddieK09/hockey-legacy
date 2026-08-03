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
// Top goal crease
rinkGraphics.fillStyle(0xbfe9ff, 0.75);
rinkGraphics.lineStyle(3, 0x4fc3ff, 1);

rinkGraphics.beginPath();

rinkGraphics.moveTo(
    this.cameras.main.centerX - 40,
    this.cameras.main.centerY - 300
);

rinkGraphics.lineTo(
    this.cameras.main.centerX + 40,
    this.cameras.main.centerY - 300
);

rinkGraphics.arc(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 300,
    40,
    0,
    Math.PI,
    false
);

rinkGraphics.closePath();
rinkGraphics.fillPath();
rinkGraphics.strokePath();


// Bottom goal crease
rinkGraphics.beginPath();

rinkGraphics.moveTo(
    this.cameras.main.centerX + 40,
    this.cameras.main.centerY + 300
);

rinkGraphics.lineTo(
    this.cameras.main.centerX - 40,
    this.cameras.main.centerY + 300
);

rinkGraphics.arc(
    this.cameras.main.centerX,
    this.cameras.main.centerY + 300,
    40,
    Math.PI,
    Math.PI * 2,
    false
);

rinkGraphics.closePath();
rinkGraphics.fillPath();
rinkGraphics.strokePath();
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

rinkGraphics.beginPath();

rinkGraphics.arc(
this.cameras.main.centerX + 165,
    this.cameras.main.centerY,
    28,
Phaser.Math.DegToRad(90),
Phaser.Math.DegToRad(270),
    false
);

rinkGraphics.strokePath();
});


}