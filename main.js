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
    const scene = this;

    const rink = {
        width: 330,
        height: 610,
        cornerRadius: 55
    };

    rink.centerX = scene.cameras.main.centerX;
    rink.centerY = scene.cameras.main.centerY;

    rink.left = rink.centerX - rink.width / 2;
    rink.right = rink.centerX + rink.width / 2;
    rink.top = rink.centerY - rink.height / 2;
    rink.bottom = rink.centerY + rink.height / 2;

    const titleText = scene.add.text(
        rink.centerX,
        80,
        "HOCKEY LEGACY",
        {
            font: "40px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    const versionText = scene.add.text(
        rink.centerX,
        170,
        "Version 0.0.36",
        {
            font: "24px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    const playButton = scene.add.text(
        rink.centerX,
        300,
        "▶ PLAY",
        {
            font: "36px Arial",
            fill: "#ffff00"
        }
    )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    playButton.on("pointerdown", () => {
        playButton.disableInteractive();

        titleText.setVisible(false);
        versionText.setVisible(false);
        playButton.setVisible(false);

        scene.cameras.main.setBackgroundColor("#d8f0ff");

        drawRink(scene, rink);
    });
}

function drawRink(scene, rink) {
    const graphics = scene.add.graphics();

    drawIceSurface(graphics, rink);
    drawMainLines(graphics, rink);
    drawCenterIce(graphics, rink);
    drawFaceoffLayout(graphics, rink);
    drawGoalsAndCreases(graphics, rink);
    drawRefereeCrease(graphics, rink);
}

function drawIceSurface(graphics, rink) {
    graphics.fillStyle(0xf4fbff, 1);

    graphics.fillRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
    );

    graphics.lineStyle(4, 0x1d5fa7, 1);

    graphics.strokeRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
    );
}

function drawMainLines(graphics, rink) {
    const lineLeft = rink.left + 3;
    const lineRight = rink.right - 3;

    const blueLineOffset = 150;

    graphics.lineStyle(4, 0xff3b30, 1);

    graphics.lineBetween(
        lineLeft,
        rink.centerY,
        lineRight,
        rink.centerY
    );

    graphics.lineStyle(4, 0x1d5fa7, 1);

    graphics.lineBetween(
        lineLeft,
        rink.centerY - blueLineOffset,
        lineRight,
        rink.centerY - blueLineOffset
    );

    graphics.lineBetween(
        lineLeft,
        rink.centerY + blueLineOffset,
        lineRight,
        rink.centerY + blueLineOffset
    );
}

function drawCenterIce(graphics, rink) {
    graphics.lineStyle(3, 0x4fc3ff, 1);

    graphics.strokeCircle(
        rink.centerX,
        rink.centerY,
        42
    );

    graphics.fillStyle(0x4fc3ff, 1);

    graphics.fillCircle(
        rink.centerX,
        rink.centerY,
        4
    );
}

function drawFaceoffLayout(graphics, rink) {
    const offensiveOffsetX = 85;
    const offensiveOffsetY = 215;

    const neutralOffsetX = 95;
    const neutralOffsetY = 75;

    const circleRadius = 34;

    const topLeftX = rink.centerX - offensiveOffsetX;
    const topRightX = rink.centerX + offensiveOffsetX;
    const topY = rink.centerY - offensiveOffsetY;

    const bottomLeftX = rink.centerX - offensiveOffsetX;
    const bottomRightX = rink.centerX + offensiveOffsetX;
    const bottomY = rink.centerY + offensiveOffsetY;

    graphics.lineStyle(3, 0xff3b30, 1);

    drawFaceoffCircle(
        graphics,
        topLeftX,
        topY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        topRightX,
        topY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        bottomLeftX,
        bottomY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        bottomRightX,
        bottomY,
        circleRadius
    );

    graphics.fillStyle(0xff3b30, 1);

    drawFaceoffDot(
        graphics,
        topLeftX,
        topY,
        4
    );

    drawFaceoffDot(
        graphics,
        topRightX,
        topY,
        4
    );

    drawFaceoffDot(
        graphics,
        bottomLeftX,
        bottomY,
        4
    );

    drawFaceoffDot(
        graphics,
        bottomRightX,
        bottomY,
        4
    );

    drawFaceoffDot(
        graphics,
        rink.centerX - neutralOffsetX,
        rink.centerY - neutralOffsetY,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + neutralOffsetX,
        rink.centerY - neutralOffsetY,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX - neutralOffsetX,
        rink.centerY + neutralOffsetY,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + neutralOffsetX,
        rink.centerY + neutralOffsetY,
        3
    );
}

function drawFaceoffCircle(graphics, x, y, radius) {
    graphics.strokeCircle(
        x,
        y,
        radius
    );

    const hashLength = 8;
    const hashGap = 4;

    graphics.lineBetween(
        x - hashGap,
        y - radius - hashLength,
        x - hashGap,
        y - radius + 2
    );

    graphics.lineBetween(
        x + hashGap,
        y - radius - hashLength,
        x + hashGap,
        y - radius + 2
    );

    graphics.lineBetween(
        x - hashGap,
        y + radius - 2,
        x - hashGap,
        y + radius + hashLength
    );

    graphics.lineBetween(
        x + hashGap,
        y + radius - 2,
        x + hashGap,
        y + radius + hashLength
    );

    graphics.lineBetween(
        x - radius - hashLength,
        y - hashGap,
        x - radius + 2,
        y - hashGap
    );

    graphics.lineBetween(
        x - radius - hashLength,
        y + hashGap,
        x - radius + 2,
        y + hashGap
    );

    graphics.lineBetween(
        x + radius - 2,
        y - hashGap,
        x + radius + hashLength,
        y - hashGap
    );

    graphics.lineBetween(
        x + radius - 2,
        y + hashGap,
        x + radius + hashLength,
        y + hashGap
    );
}

function drawFaceoffDot(graphics, x, y, radius) {
    graphics.fillCircle(
        x,
        y,
        radius
    );
}

function drawGoalsAndCreases(graphics, rink) {
    const goalLineInset = 44;

    const topGoalLineY = rink.top + goalLineInset;
    const bottomGoalLineY = rink.bottom - goalLineInset;

    drawGoalLine(
        graphics,
        rink,
        topGoalLineY
    );

    drawGoalLine(
        graphics,
        rink,
        bottomGoalLineY
    );

    drawGoalCrease(
        graphics,
        rink.centerX,
        topGoalLineY,
        "top"
    );

    drawGoalCrease(
        graphics,
        rink.centerX,
        bottomGoalLineY,
        "bottom"
    );

    drawGoalNet(
        graphics,
        rink.centerX,
        topGoalLineY,
        "top"
    );

    drawGoalNet(
        graphics,
        rink.centerX,
        bottomGoalLineY,
        "bottom"
    );
}

function drawGoalLine(graphics, rink, y) {
    graphics.lineStyle(3, 0xff3b30, 1);

    graphics.lineBetween(
        rink.left + 4,
        y,
        rink.right - 4,
        y
    );
}

function drawGoalCrease(graphics, centerX, goalLineY, side) {
    const creaseRadius = 40;

    graphics.fillStyle(0xbfe9ff, 0.75);
    graphics.lineStyle(3, 0x4fc3ff, 1);

    graphics.beginPath();

    if (side === "top") {
        graphics.moveTo(
            centerX - creaseRadius,
            goalLineY
        );

        graphics.lineTo(
            centerX + creaseRadius,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            creaseRadius,
            0,
            Math.PI,
            false
        );
    } else {
        graphics.moveTo(
            centerX + creaseRadius,
            goalLineY
        );

        graphics.lineTo(
            centerX - creaseRadius,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            creaseRadius,
            Math.PI,
            Math.PI * 2,
            false
        );
    }

    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
}

function drawGoalNet(graphics, centerX, goalLineY, side) {
    const mouthHalfWidth = 20;
    const backHalfWidth = 15;
    const netDepth = 20;

    const direction = side === "top" ? -1 : 1;
    const backY = goalLineY + netDepth * direction;
    const middleY = goalLineY + netDepth * 0.5 * direction;

    graphics.lineStyle(2, 0x9fb3c8, 0.9);

    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX - backHalfWidth,
        backY
    );

    graphics.lineBetween(
        centerX - backHalfWidth,
        backY,
        centerX + backHalfWidth,
        backY
    );

    graphics.lineBetween(
        centerX + backHalfWidth,
        backY,
        centerX + mouthHalfWidth,
        goalLineY
    );

    graphics.lineBetween(
        centerX - 18,
        middleY,
        centerX + 18,
        middleY
    );

    graphics.lineBetween(
        centerX - 10,
        goalLineY,
        centerX - 8,
        backY
    );

    graphics.lineBetween(
        centerX,
        goalLineY,
        centerX,
        backY
    );

    graphics.lineBetween(
        centerX + 10,
        goalLineY,
        centerX + 8,
        backY
    );

    graphics.lineStyle(4, 0xff3b30, 1);

    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX + mouthHalfWidth,
        goalLineY
    );

    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX - mouthHalfWidth,
        goalLineY + 7 * direction
    );

    graphics.lineBetween(
        centerX + mouthHalfWidth,
        goalLineY,
        centerX + mouthHalfWidth,
        goalLineY + 7 * direction
    );

    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY + 7 * direction,
        centerX + mouthHalfWidth,
        goalLineY + 7 * direction
    );
}

function drawRefereeCrease(graphics, rink) {
    graphics.lineStyle(3, 0xff3b30, 1);

    graphics.beginPath();

    graphics.arc(
        rink.right,
        rink.centerY,
        28,
        Phaser.Math.DegToRad(90),
        Phaser.Math.DegToRad(270),
        false
    );

    graphics.strokePath();
}