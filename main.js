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
        "Version 0.0.37",
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
    // Ice surface
    graphics.fillStyle(0xf4fbff, 1);

    graphics.fillRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
    );

    // Boards
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
    const lineLeft = rink.left + 4;
    const lineRight = rink.right - 4;
    const blueLineOffset = 150;

    // Center red line
    graphics.lineStyle(4, 0xff3b30, 1);

    graphics.lineBetween(
        lineLeft,
        rink.centerY,
        lineRight,
        rink.centerY
    );

    // Blue lines
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
    // Center circle
    graphics.lineStyle(3, 0x4fc3ff, 1);

    graphics.strokeCircle(
        rink.centerX,
        rink.centerY,
        42
    );

    // Center dot
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

    const topY = rink.centerY - offensiveOffsetY;
    const bottomY = rink.centerY + offensiveOffsetY;

    const leftX = rink.centerX - offensiveOffsetX;
    const rightX = rink.centerX + offensiveOffsetX;

    graphics.lineStyle(3, 0xff3b30, 1);

    drawFaceoffCircle(
        graphics,
        leftX,
        topY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        rightX,
        topY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        leftX,
        bottomY,
        circleRadius
    );

    drawFaceoffCircle(
        graphics,
        rightX,
        bottomY,
        circleRadius
    );

    graphics.fillStyle(0xff3b30, 1);

    // Offensive-zone faceoff dots
    drawFaceoffDot(graphics, leftX, topY, 3);
    drawFaceoffDot(graphics, rightX, topY, 3);
    drawFaceoffDot(graphics, leftX, bottomY, 3);
    drawFaceoffDot(graphics, rightX, bottomY, 3);

    // Neutral-zone faceoff dots
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
    graphics.strokeCircle(x, y, radius);

    const outsideLength = 7;
    const insideLength = 3;
    const hashGap = 5;

    // Top hashes
    graphics.lineBetween(
        x - hashGap,
        y - radius - outsideLength,
        x - hashGap,
        y - radius + insideLength
    );

    graphics.lineBetween(
        x + hashGap,
        y - radius - outsideLength,
        x + hashGap,
        y - radius + insideLength
    );

    // Bottom hashes
    graphics.lineBetween(
        x - hashGap,
        y + radius - insideLength,
        x - hashGap,
        y + radius + outsideLength
    );

    graphics.lineBetween(
        x + hashGap,
        y + radius - insideLength,
        x + hashGap,
        y + radius + outsideLength
    );

    // Left hashes
    graphics.lineBetween(
        x - radius - outsideLength,
        y - hashGap,
        x - radius + insideLength,
        y - hashGap
    );

    graphics.lineBetween(
        x - radius - outsideLength,
        y + hashGap,
        x - radius + insideLength,
        y + hashGap
    );

    // Right hashes
    graphics.lineBetween(
        x + radius - insideLength,
        y - hashGap,
        x + radius + outsideLength,
        y - hashGap
    );

    graphics.lineBetween(
        x + radius - insideLength,
        y + hashGap,
        x + radius + outsideLength,
        y + hashGap
    );
}

function drawFaceoffDot(graphics, x, y, radius) {
    graphics.fillCircle(x, y, radius);
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
    const creaseHalfWidth = 36;
    const creaseDepth = 32;

    graphics.fillStyle(0xbfe9ff, 0.75);
    graphics.lineStyle(3, 0x4fc3ff, 1);

    graphics.beginPath();

    if (side === "top") {
        graphics.moveTo(
            centerX - creaseHalfWidth,
            goalLineY
        );

        graphics.lineTo(
            centerX + creaseHalfWidth,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            creaseDepth,
            0,
            Math.PI,
            false
        );
    } else {
        graphics.moveTo(
            centerX + creaseHalfWidth,
            goalLineY
        );

        graphics.lineTo(
            centerX - creaseHalfWidth,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            creaseDepth,
            Math.PI,
            Math.PI * 2,
            false
        );
    }

    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Restore the visible goal-line section through the crease.
    graphics.lineStyle(3, 0xff3b30, 1);

    graphics.lineBetween(
        centerX - creaseHalfWidth,
        goalLineY,
        centerX + creaseHalfWidth,
        goalLineY
    );
}

function drawGoalNet(graphics, centerX, goalLineY, side) {
    const direction = side === "top" ? -1 : 1;

    const mouthHalfWidth = 20;
    const backHalfWidth = 15;
    const netDepth = 18;

    const backY = goalLineY + netDepth * direction;
    const middleY = goalLineY + netDepth * 0.5 * direction;

    // Grey net outline
    graphics.lineStyle(2, 0x9fb3c8, 0.9);

    // Left side
    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX - backHalfWidth,
        backY
    );

    // Back of net
    graphics.lineBetween(
        centerX - backHalfWidth,
        backY,
        centerX + backHalfWidth,
        backY
    );

    // Right side
    graphics.lineBetween(
        centerX + backHalfWidth,
        backY,
        centerX + mouthHalfWidth,
        goalLineY
    );

    // Horizontal mesh line
    graphics.lineBetween(
        centerX - 17,
        middleY,
        centerX + 17,
        middleY
    );

    // Vertical mesh lines
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

    // Red goal frame
    graphics.lineStyle(4, 0xff3b30, 1);

    // Goal mouth
    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX + mouthHalfWidth,
        goalLineY
    );

    // Left frame
    graphics.lineBetween(
        centerX - mouthHalfWidth,
        goalLineY,
        centerX - backHalfWidth,
        backY
    );

    // Right frame
    graphics.lineBetween(
        centerX + mouthHalfWidth,
        goalLineY,
        centerX + backHalfWidth,
        backY
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