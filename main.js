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
        "Version 0.0.35",
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
    drawFaceoffCircles(graphics, rink);
    drawFaceoffDots(graphics, rink);
    drawGoalsAndCreases(graphics, rink);
    drawRefereeCrease(graphics, rink);
}

function drawIceSurface(graphics, rink) {
    // Ice
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
    const lineLeft = rink.left + 3;
    const lineRight = rink.right - 3;

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
        rink.centerY - 150,
        lineRight,
        rink.centerY - 150
    );

    graphics.lineBetween(
        lineLeft,
        rink.centerY + 150,
        lineRight,
        rink.centerY + 150
    );
}

function drawCenterIce(graphics, rink) {
    // Center circle
    graphics.lineStyle(4, 0x4fc3ff, 1);

    graphics.strokeCircle(
        rink.centerX,
        rink.centerY,
        42
    );

    // Center faceoff dot
    graphics.fillStyle(0x4fc3ff, 1);

    graphics.fillCircle(
        rink.centerX,
        rink.centerY,
        4
    );
}

function drawFaceoffCircles(graphics, rink) {
    const circleOffsetX = 85;
    const circleOffsetY = 225;
    const circleRadius = 34;

    graphics.lineStyle(3, 0xff3b30, 1);

    graphics.strokeCircle(
        rink.centerX - circleOffsetX,
        rink.centerY - circleOffsetY,
        circleRadius
    );

    graphics.strokeCircle(
        rink.centerX + circleOffsetX,
        rink.centerY - circleOffsetY,
        circleRadius
    );

    graphics.strokeCircle(
        rink.centerX - circleOffsetX,
        rink.centerY + circleOffsetY,
        circleRadius
    );

    graphics.strokeCircle(
        rink.centerX + circleOffsetX,
        rink.centerY + circleOffsetY,
        circleRadius
    );
}

function drawFaceoffDots(graphics, rink) {
    graphics.fillStyle(0xff3b30, 1);

    // Offensive-zone faceoff dots
    drawFaceoffDot(
        graphics,
        rink.centerX - 85,
        rink.centerY - 225
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 85,
        rink.centerY - 225
    );

    drawFaceoffDot(
        graphics,
        rink.centerX - 85,
        rink.centerY + 225
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 85,
        rink.centerY + 225
    );

    // Neutral-zone faceoff dots
    drawFaceoffDot(
        graphics,
        rink.centerX - 95,
        rink.centerY - 75
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 95,
        rink.centerY - 75
    );

    drawFaceoffDot(
        graphics,
        rink.centerX - 95,
        rink.centerY + 75
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 95,
        rink.centerY + 75
    );
}

function drawFaceoffDot(graphics, x, y) {
    graphics.fillCircle(x, y, 3);
}

function drawGoalsAndCreases(graphics, rink) {
    const goalLineInset = 36;

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
        rink.left + 3,
        y,
        rink.right - 3,
        y
    );
}

function drawGoalCrease(graphics, centerX, goalLineY, side) {
    const creaseRadius = 40;
    const creaseDepth = 32;

    graphics.fillStyle(0xbfe9ff, 0.75);
    graphics.lineStyle(3, 0x4fc3ff, 1);

    graphics.beginPath();

    if (side === "top") {
        // Straight edge sits on the goal line.
        graphics.moveTo(
            centerX - creaseRadius,
            goalLineY
        );

        graphics.lineTo(
            centerX + creaseRadius,
            goalLineY
        );

        // Curve extends inward toward center ice.
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
            centerX + creaseRadius,
            goalLineY
        );

        graphics.lineTo(
            centerX - creaseRadius,
            goalLineY
        );

        // Curve extends inward toward center ice.
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
}

function drawGoalNet(graphics, centerX, goalLineY, side) {
    const mouthHalfWidth = 18;
    const backHalfWidth = 14;
    const netDepth = 20;

    let backY;

    if (side === "top") {
        backY = goalLineY - netDepth;
    } else {
        backY = goalLineY + netDepth;
    }

    // Grey netting
    graphics.lineStyle(2, 0x9fb3c8, 0.9);

    // Outer trapezoid
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

    // Middle horizontal mesh
    const middleY = (goalLineY + backY) / 2;

    graphics.lineBetween(
        centerX - 16,
        middleY,
        centerX + 16,
        middleY
    );

    // Vertical mesh
    graphics.lineBetween(
        centerX - 9,
        goalLineY,
        centerX - 7,
        backY
    );

    graphics.lineBetween(
        centerX,
        goalLineY,
        centerX,
        backY
    );

    graphics.lineBetween(
        centerX + 9,
        goalLineY,
        centerX + 7,
        backY
    );

    // Red posts and crossbar
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
        centerX - backHalfWidth,
        backY
    );

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