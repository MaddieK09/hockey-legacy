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
    const rinkWidth = 330;
    const rinkHeight = 610;

    const rinkCenterX = this.cameras.main.centerX;
    const rinkCenterY = this.cameras.main.centerY;

    const rinkTop = rinkCenterY - rinkHeight / 2;
    const rinkBottom = rinkCenterY + rinkHeight / 2;
    const rinkLeft = rinkCenterX - rinkWidth / 2;
    const rinkRight = rinkCenterX + rinkWidth / 2;

    const titleText = this.add.text(
        rinkCenterX,
        80,
        "HOCKEY LEGACY",
        {
            font: "40px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    const versionText = this.add.text(
        rinkCenterX,
        170,
        "Version 0.0.34",
        {
            font: "24px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    const playButton = this.add.text(
        rinkCenterX,
        300,
        "▶ PLAY",
        {
            font: "36px Arial",
            fill: "#ffff00"
        }
    )
        .setOrigin(0.5)
        .setInteractive();

    playButton.on("pointerdown", () => {
        this.cameras.main.setBackgroundColor("#d8f0ff");

        playButton.setVisible(false);
        titleText.setVisible(false);
        versionText.setVisible(false);

        const rinkGraphics = this.add.graphics();

        // Ice surface
        rinkGraphics.fillStyle(0xf4fbff, 1);

        rinkGraphics.fillRoundedRect(
            rinkLeft,
            rinkTop,
            rinkWidth,
            rinkHeight,
            55
        );

        // Boards
        rinkGraphics.lineStyle(4, 0x1d5fa7, 1);

        rinkGraphics.strokeRoundedRect(
            rinkLeft,
            rinkTop,
            rinkWidth,
            rinkHeight,
            55
        );

        // Center red line
        this.add.rectangle(
            rinkCenterX,
            rinkCenterY,
            rinkWidth,
            4,
            0xff0000
        );

        // Top blue line
        this.add.rectangle(
            rinkCenterX,
            rinkCenterY - 150,
            rinkWidth,
            4,
            0x1d5fa7
        );

        // Bottom blue line
        this.add.rectangle(
            rinkCenterX,
            rinkCenterY + 150,
            rinkWidth,
            4,
            0x1d5fa7
        );

        // Center circle
        rinkGraphics.lineStyle(4, 0x4fc3ff, 1);

        rinkGraphics.strokeCircle(
            rinkCenterX,
            rinkCenterY,
            42
        );

        // Center faceoff dots
        rinkGraphics.fillStyle(0x4fc3ff, 1);

        rinkGraphics.fillCircle(
            rinkCenterX - 95,
            rinkCenterY,
            4
        );

        rinkGraphics.fillCircle(
            rinkCenterX + 95,
            rinkCenterY,
            4
        );

        // Offensive-zone faceoff circles
        rinkGraphics.lineStyle(3, 0xff3b30, 1);

        rinkGraphics.strokeCircle(
            rinkCenterX - 85,
            rinkCenterY - 225,
            34
        );

        rinkGraphics.strokeCircle(
            rinkCenterX + 85,
            rinkCenterY - 225,
            34
        );

        rinkGraphics.strokeCircle(
            rinkCenterX - 85,
            rinkCenterY + 225,
            34
        );

        rinkGraphics.strokeCircle(
            rinkCenterX + 85,
            rinkCenterY + 225,
            34
        );

        // Top goal crease
        rinkGraphics.fillStyle(0xbfe9ff, 0.75);
        rinkGraphics.lineStyle(3, 0x4fc3ff, 1);

        rinkGraphics.beginPath();

        rinkGraphics.moveTo(
            rinkCenterX - 40,
            rinkTop + 7
        );

        rinkGraphics.lineTo(
            rinkCenterX + 40,
            rinkTop + 7
        );

        rinkGraphics.arc(
            rinkCenterX,
            rinkTop + 7,
            40,
            0,
            Math.PI,
            false
        );

        rinkGraphics.closePath();
        rinkGraphics.fillPath();
        rinkGraphics.strokePath();

        // Top red goal line
        rinkGraphics.lineStyle(3, 0xff3b30, 1);

        rinkGraphics.lineBetween(
            rinkLeft,
            rinkTop + 11,
            rinkRight,
            rinkTop + 11
        );

        // Bottom goal crease
        rinkGraphics.fillStyle(0xbfe9ff, 0.75);
        rinkGraphics.lineStyle(3, 0x4fc3ff, 1);

        rinkGraphics.beginPath();

        rinkGraphics.moveTo(
            rinkCenterX + 40,
            rinkBottom - 7
        );

        rinkGraphics.lineTo(
            rinkCenterX - 40,
            rinkBottom - 7
        );

        rinkGraphics.arc(
            rinkCenterX,
            rinkBottom - 7,
            40,
            Math.PI,
            Math.PI * 2,
            false
        );

        rinkGraphics.closePath();
        rinkGraphics.fillPath();
        rinkGraphics.strokePath();

        // Bottom red goal line
        rinkGraphics.lineStyle(3, 0xff3b30, 1);

        rinkGraphics.lineBetween(
            rinkLeft,
            rinkBottom - 11,
            rinkRight,
            rinkBottom - 11
        );

        // Top goal net
        rinkGraphics.lineStyle(2, 0x9fb3c8, 0.9);

        const topNetFrontY = rinkTop + 25;
        const topNetBackY = rinkTop + 7;

        // Top net outer shape
        rinkGraphics.lineBetween(
            rinkCenterX - 18,
            topNetFrontY,
            rinkCenterX - 14,
            topNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX - 14,
            topNetBackY,
            rinkCenterX + 14,
            topNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX + 14,
            topNetBackY,
            rinkCenterX + 18,
            topNetFrontY
        );

        // Top net horizontal mesh
        rinkGraphics.lineBetween(
            rinkCenterX - 16,
            rinkTop + 16,
            rinkCenterX + 16,
            rinkTop + 16
        );

        // Top net vertical mesh
        rinkGraphics.lineBetween(
            rinkCenterX - 9,
            topNetFrontY,
            rinkCenterX - 7,
            topNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX,
            topNetFrontY,
            rinkCenterX,
            topNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX + 9,
            topNetFrontY,
            rinkCenterX + 7,
            topNetBackY
        );

        // Top red goal frame
        rinkGraphics.fillStyle(0xff3b30, 1);

        rinkGraphics.fillRect(
            rinkCenterX - 18,
            topNetFrontY - 2,
            36,
            4
        );

        rinkGraphics.fillRect(
            rinkCenterX - 20,
            topNetBackY,
            4,
            18
        );

        rinkGraphics.fillRect(
            rinkCenterX + 16,
            topNetBackY,
            4,
            18
        );

        // Bottom goal net
        rinkGraphics.lineStyle(2, 0x9fb3c8, 0.9);

        const bottomNetFrontY = rinkBottom - 25;
        const bottomNetBackY = rinkBottom - 7;

        // Bottom net outer shape
        rinkGraphics.lineBetween(
            rinkCenterX - 18,
            bottomNetFrontY,
            rinkCenterX - 14,
            bottomNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX - 14,
            bottomNetBackY,
            rinkCenterX + 14,
            bottomNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX + 14,
            bottomNetBackY,
            rinkCenterX + 18,
            bottomNetFrontY
        );

        // Bottom net horizontal mesh
        rinkGraphics.lineBetween(
            rinkCenterX - 16,
            rinkBottom - 16,
            rinkCenterX + 16,
            rinkBottom - 16
        );

        // Bottom net vertical mesh
        rinkGraphics.lineBetween(
            rinkCenterX - 9,
            bottomNetFrontY,
            rinkCenterX - 7,
            bottomNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX,
            bottomNetFrontY,
            rinkCenterX,
            bottomNetBackY
        );

        rinkGraphics.lineBetween(
            rinkCenterX + 9,
            bottomNetFrontY,
            rinkCenterX + 7,
            bottomNetBackY
        );

        // Bottom red goal frame
        rinkGraphics.fillStyle(0xff3b30, 1);

        rinkGraphics.fillRect(
            rinkCenterX - 18,
            bottomNetFrontY - 2,
            36,
            4
        );

        rinkGraphics.fillRect(
            rinkCenterX - 20,
            bottomNetFrontY,
            4,
            18
        );

        rinkGraphics.fillRect(
            rinkCenterX + 16,
            bottomNetFrontY,
            4,
            18
        );

        // Right-side center referee crease
        rinkGraphics.lineStyle(3, 0xff3b30, 1);

        rinkGraphics.beginPath();

        rinkGraphics.arc(
            rinkRight,
            rinkCenterY,
            28,
            Phaser.Math.DegToRad(90),
            Phaser.Math.DegToRad(270),
            false
        );

        rinkGraphics.strokePath();
    });
}