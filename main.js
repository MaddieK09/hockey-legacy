const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0d7a2b",

    scene: {
        create: create,
        update: update
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

    scene.gameState = {
        rink: rink,
        gameStarted: false,

        player: null,
        playerStick: null,
        puck: null,

        playerVelocityX: 0,
        playerVelocityY: 0,

        puckVelocityX: 0,
        puckVelocityY: 0,

        playerSpeed: 155,
        puckFriction: 0.985,

        playerRadius: 11,
        puckRadius: 5,

        facingX: 0,
        facingY: -1,

        controls: {
            up: false,
            down: false,
            left: false,
            right: false
        },

        keyboard: null
    };

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
        "Version 0.0.39",
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
        createPlayer(scene);
        createPuck(scene);
        createMobileControls(scene);
        createKeyboardControls(scene);

        scene.gameState.gameStarted = true;
    });
}

function update(time, delta) {
    const state = this.gameState;

    if (!state || !state.gameStarted) {
        return;
    }

    const deltaSeconds = Math.min(delta / 1000, 0.05);

    updatePlayerInput(this);
    updatePlayerMovement(this, deltaSeconds);
    updatePuckMovement(this, deltaSeconds);
    handlePlayerPuckContact(this);
    updatePlayerStick(this);
}

function drawRink(scene, rink) {
    const graphics = scene.add.graphics();

    drawIceSurface(graphics, rink);
    drawMainLines(graphics, rink);
    drawCenterIce(graphics, rink);
    drawFaceoffLayout(graphics, rink);
    drawGoalsAndCreases(graphics, rink);
    drawGoalieTrapezoids(graphics, rink);
    drawRefereeCrease(graphics, rink);

    drawBoardOutline(graphics, rink);
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
}

function drawBoardOutline(graphics, rink) {
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

    const topY = rink.centerY - offensiveOffsetY;
    const bottomY = rink.centerY + offensiveOffsetY;

    const leftX = rink.centerX - offensiveOffsetX;
    const rightX = rink.centerX + offensiveOffsetX;

    graphics.lineStyle(2, 0xff3b30, 1);

    drawFaceoffCircle(graphics, leftX, topY, circleRadius);
    drawFaceoffCircle(graphics, rightX, topY, circleRadius);
    drawFaceoffCircle(graphics, leftX, bottomY, circleRadius);
    drawFaceoffCircle(graphics, rightX, bottomY, circleRadius);

    graphics.fillStyle(0xff3b30, 1);

    drawFaceoffDot(graphics, leftX, topY, 3);
    drawFaceoffDot(graphics, rightX, topY, 3);
    drawFaceoffDot(graphics, leftX, bottomY, 3);
    drawFaceoffDot(graphics, rightX, bottomY, 3);

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

    drawCircleHashes(graphics, x, y, radius);
    drawFaceoffLMarks(graphics, x, y);
}

function drawCircleHashes(graphics, x, y, radius) {
    const outsideLength = 5;
    const insideLength = 2;
    const hashGap = 5;

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

function drawFaceoffLMarks(graphics, x, y) {
    const horizontalOffset = 11;
    const verticalOffset = 8;
    const markLength = 6;

    graphics.lineBetween(
        x - horizontalOffset,
        y - verticalOffset,
        x - horizontalOffset + markLength,
        y - verticalOffset
    );

    graphics.lineBetween(
        x - horizontalOffset,
        y - verticalOffset,
        x - horizontalOffset,
        y - verticalOffset + markLength
    );

    graphics.lineBetween(
        x + horizontalOffset,
        y - verticalOffset,
        x + horizontalOffset - markLength,
        y - verticalOffset
    );

    graphics.lineBetween(
        x + horizontalOffset,
        y - verticalOffset,
        x + horizontalOffset,
        y - verticalOffset + markLength
    );

    graphics.lineBetween(
        x - horizontalOffset,
        y + verticalOffset,
        x - horizontalOffset + markLength,
        y + verticalOffset
    );

    graphics.lineBetween(
        x - horizontalOffset,
        y + verticalOffset,
        x - horizontalOffset,
        y + verticalOffset - markLength
    );

    graphics.lineBetween(
        x + horizontalOffset,
        y + verticalOffset,
        x + horizontalOffset - markLength,
        y + verticalOffset
    );

    graphics.lineBetween(
        x + horizontalOffset,
        y + verticalOffset,
        x + horizontalOffset,
        y + verticalOffset - markLength
    );
}

function drawFaceoffDot(graphics, x, y, radius) {
    graphics.fillCircle(x, y, radius);
}

function drawGoalsAndCreases(graphics, rink) {
    const goalLineInset = 44;

    const topGoalLineY = rink.top + goalLineInset;
    const bottomGoalLineY = rink.bottom - goalLineInset;

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
    const creaseHalfWidth = 34;
    const creaseDepth = 32;

    const direction = side === "top" ? 1 : -1;
    const curveCenterY = goalLineY;

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
            curveCenterY,
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
            curveCenterY,
            creaseDepth,
            Math.PI,
            Math.PI * 2,
            false
        );
    }

    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    graphics.lineStyle(2, 0x4fc3ff, 1);

    graphics.lineBetween(
        centerX - 18,
        goalLineY,
        centerX - 18,
        goalLineY + 6 * direction
    );

    graphics.lineBetween(
        centerX + 18,
        goalLineY,
        centerX + 18,
        goalLineY + 6 * direction
    );
}

function drawGoalNet(graphics, centerX, goalLineY, side) {
    const direction = side === "top" ? -1 : 1;

    const mouthHalfWidth = 20;
    const backHalfWidth = 14;
    const netDepth = 28;

    const backY = goalLineY + netDepth * direction;
    const firstMeshY = goalLineY + netDepth * 0.33 * direction;
    const secondMeshY = goalLineY + netDepth * 0.66 * direction;

    graphics.lineStyle(1, 0x9fb3c8, 0.95);

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
        firstMeshY,
        centerX + 18,
        firstMeshY
    );

    graphics.lineBetween(
        centerX - 16,
        secondMeshY,
        centerX + 16,
        secondMeshY
    );

    graphics.lineBetween(
        centerX - 12,
        goalLineY,
        centerX - 9,
        backY
    );

    graphics.lineBetween(
        centerX - 6,
        goalLineY,
        centerX - 4,
        backY
    );

    graphics.lineBetween(
        centerX,
        goalLineY,
        centerX,
        backY
    );

    graphics.lineBetween(
        centerX + 6,
        goalLineY,
        centerX + 4,
        backY
    );

    graphics.lineBetween(
        centerX + 12,
        goalLineY,
        centerX + 9,
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
        centerX - backHalfWidth,
        backY
    );

    graphics.lineBetween(
        centerX + mouthHalfWidth,
        goalLineY,
        centerX + backHalfWidth,
        backY
    );

    graphics.lineBetween(
        centerX - backHalfWidth,
        backY,
        centerX + backHalfWidth,
        backY
    );
}

function drawGoalieTrapezoids(graphics, rink) {
    const goalLineInset = 44;

    const topGoalLineY = rink.top + goalLineInset;
    const bottomGoalLineY = rink.bottom - goalLineInset;

    const innerHalfWidth = 30;
    const outerHalfWidth = 48;

    graphics.lineStyle(2, 0xff3b30, 1);

    graphics.lineBetween(
        rink.centerX - innerHalfWidth,
        topGoalLineY,
        rink.centerX - outerHalfWidth,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX + innerHalfWidth,
        topGoalLineY,
        rink.centerX + outerHalfWidth,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX - innerHalfWidth,
        bottomGoalLineY,
        rink.centerX - outerHalfWidth,
        rink.bottom - 5
    );

    graphics.lineBetween(
        rink.centerX + innerHalfWidth,
        bottomGoalLineY,
        rink.centerX + outerHalfWidth,
        rink.bottom - 5
    );
}

function drawRefereeCrease(graphics, rink) {
    graphics.lineStyle(2, 0xff3b30, 1);

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

function createPlayer(scene) {
    const state = scene.gameState;
    const rink = state.rink;

    state.player = scene.add.circle(
        rink.centerX,
        rink.centerY + 95,
        state.playerRadius,
        0x1769d2
    );

    state.player.setStrokeStyle(
        3,
        0xffffff,
        1
    );

    state.playerStick = scene.add.graphics();
}

function createPuck(scene) {
    const state = scene.gameState;
    const rink = state.rink;

    state.puck = scene.add.circle(
        rink.centerX,
        rink.centerY + 50,
        state.puckRadius,
        0x111111
    );

    state.puck.setStrokeStyle(
        1,
        0x555555,
        1
    );
}

function createKeyboardControls(scene) {
    scene.gameState.keyboard = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,

        w: Phaser.Input.Keyboard.KeyCodes.W,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D
    });
}

function createMobileControls(scene) {
    const buttonRadius = 27;

    const controlsCenterX = 75;
    const controlsCenterY = scene.scale.height - 82;

    createControlButton(
        scene,
        controlsCenterX,
        controlsCenterY - 48,
        "▲",
        "up",
        buttonRadius
    );

    createControlButton(
        scene,
        controlsCenterX,
        controlsCenterY + 48,
        "▼",
        "down",
        buttonRadius
    );

    createControlButton(
        scene,
        controlsCenterX - 48,
        controlsCenterY,
        "◀",
        "left",
        buttonRadius
    );

    createControlButton(
        scene,
        controlsCenterX + 48,
        controlsCenterY,
        "▶",
        "right",
        buttonRadius
    );
}

function createControlButton(
    scene,
    x,
    y,
    symbol,
    controlName,
    radius
) {
    const state = scene.gameState;

    const button = scene.add.circle(
        x,
        y,
        radius,
        0x17375e,
        0.72
    );

    button.setStrokeStyle(
        2,
        0xffffff,
        0.75
    );

    button.setInteractive({
        useHandCursor: true
    });

    const label = scene.add.text(
        x,
        y,
        symbol,
        {
            font: "24px Arial",
            fill: "#ffffff"
        }
    ).setOrigin(0.5);

    label.setDepth(button.depth + 1);

    const pressButton = () => {
        state.controls[controlName] = true;

        button.setFillStyle(
            0x2f71b7,
            0.9
        );
    };

    const releaseButton = () => {
        state.controls[controlName] = false;

        button.setFillStyle(
            0x17375e,
            0.72
        );
    };

    button.on("pointerdown", pressButton);
    button.on("pointerup", releaseButton);
    button.on("pointerout", releaseButton);
    button.on("pointerupoutside", releaseButton);
}

function updatePlayerInput(scene) {
    const state = scene.gameState;
    const keyboard = state.keyboard;

    const keyboardUp =
        keyboard.up.isDown ||
        keyboard.w.isDown;

    const keyboardDown =
        keyboard.down.isDown ||
        keyboard.s.isDown;

    const keyboardLeft =
        keyboard.left.isDown ||
        keyboard.a.isDown;

    const keyboardRight =
        keyboard.right.isDown ||
        keyboard.d.isDown;

    let directionX = 0;
    let directionY = 0;

    if (state.controls.left || keyboardLeft) {
        directionX -= 1;
    }

    if (state.controls.right || keyboardRight) {
        directionX += 1;
    }

    if (state.controls.up || keyboardUp) {
        directionY -= 1;
    }

    if (state.controls.down || keyboardDown) {
        directionY += 1;
    }

    if (directionX !== 0 || directionY !== 0) {
        const length = Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

        directionX /= length;
        directionY /= length;

        state.facingX = directionX;
        state.facingY = directionY;
    }

    state.playerVelocityX =
        directionX * state.playerSpeed;

    state.playerVelocityY =
        directionY * state.playerSpeed;
}

function updatePlayerMovement(scene, deltaSeconds) {
    const state = scene.gameState;
    const player = state.player;

    let nextX =
        player.x +
        state.playerVelocityX * deltaSeconds;

    let nextY =
        player.y +
        state.playerVelocityY * deltaSeconds;

    const correctedPosition =
        clampPointInsideRoundedRink(
            nextX,
            nextY,
            state.playerRadius,
            state.rink
        );

    player.x = correctedPosition.x;
    player.y = correctedPosition.y;
}

function updatePuckMovement(scene, deltaSeconds) {
    const state = scene.gameState;
    const puck = state.puck;

    puck.x +=
        state.puckVelocityX * deltaSeconds;

    puck.y +=
        state.puckVelocityY * deltaSeconds;

    const correctedPosition =
        clampPointInsideRoundedRink(
            puck.x,
            puck.y,
            state.puckRadius,
            state.rink
        );

    if (correctedPosition.hitX) {
        state.puckVelocityX *= -0.55;
    }

    if (correctedPosition.hitY) {
        state.puckVelocityY *= -0.55;
    }

    puck.x = correctedPosition.x;
    puck.y = correctedPosition.y;

    const frameFriction = Math.pow(
        state.puckFriction,
        deltaSeconds * 60
    );

    state.puckVelocityX *= frameFriction;
    state.puckVelocityY *= frameFriction;

    if (Math.abs(state.puckVelocityX) < 0.5) {
        state.puckVelocityX = 0;
    }

    if (Math.abs(state.puckVelocityY) < 0.5) {
        state.puckVelocityY = 0;
    }
}

function handlePlayerPuckContact(scene) {
    const state = scene.gameState;

    const player = state.player;
    const puck = state.puck;

    const deltaX = puck.x - player.x;
    const deltaY = puck.y - player.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    const contactDistance =
        state.playerRadius +
        state.puckRadius +
        4;

    if (distance >= contactDistance) {
        return;
    }

    let normalX;
    let normalY;

    if (distance > 0.001) {
        normalX = deltaX / distance;
        normalY = deltaY / distance;
    } else {
        normalX = state.facingX;
        normalY = state.facingY;
    }

    const overlap = contactDistance - distance;

    puck.x += normalX * overlap;
    puck.y += normalY * overlap;

    const movementSpeed = Math.sqrt(
        state.playerVelocityX *
        state.playerVelocityX +
        state.playerVelocityY *
        state.playerVelocityY
    );

    const pushSpeed =
        50 +
        movementSpeed * 0.8;

    state.puckVelocityX =
        normalX * pushSpeed +
        state.playerVelocityX * 0.45;

    state.puckVelocityY =
        normalY * pushSpeed +
        state.playerVelocityY * 0.45;
}

function updatePlayerStick(scene) {
    const state = scene.gameState;

    const player = state.player;
    const stick = state.playerStick;

    const perpendicularX = -state.facingY;
    const perpendicularY = state.facingX;

    const handX =
        player.x +
        state.facingX * 6 +
        perpendicularX * 6;

    const handY =
        player.y +
        state.facingY * 6 +
        perpendicularY * 6;

    const bladeX =
        player.x +
        state.facingX * 25 +
        perpendicularX * 8;

    const bladeY =
        player.y +
        state.facingY * 25 +
        perpendicularY * 8;

    stick.clear();

    stick.lineStyle(
        3,
        0x6e4524,
        1
    );

    stick.lineBetween(
        handX,
        handY,
        bladeX,
        bladeY
    );

    stick.lineStyle(
        4,
        0x222222,
        1
    );

    stick.lineBetween(
        bladeX,
        bladeY,
        bladeX + perpendicularX * 8,
        bladeY + perpendicularY * 8
    );
}

function clampPointInsideRoundedRink(
    x,
    y,
    objectRadius,
    rink
) {
    const insetLeft =
        rink.left + objectRadius + 4;

    const insetRight =
        rink.right - objectRadius - 4;

    const insetTop =
        rink.top + objectRadius + 4;

    const insetBottom =
        rink.bottom - objectRadius - 4;

    const innerCornerRadius =
        Math.max(
            rink.cornerRadius -
            objectRadius -
            4,
            1
        );

    let correctedX = Phaser.Math.Clamp(
        x,
        insetLeft,
        insetRight
    );

    let correctedY = Phaser.Math.Clamp(
        y,
        insetTop,
        insetBottom
    );

    let hitX = correctedX !== x;
    let hitY = correctedY !== y;

    const cornerCenters = [
        {
            x: rink.left + rink.cornerRadius,
            y: rink.top + rink.cornerRadius
        },
        {
            x: rink.right - rink.cornerRadius,
            y: rink.top + rink.cornerRadius
        },
        {
            x: rink.left + rink.cornerRadius,
            y: rink.bottom - rink.cornerRadius
        },
        {
            x: rink.right - rink.cornerRadius,
            y: rink.bottom - rink.cornerRadius
        }
    ];

    const isLeftSide =
        correctedX <
        rink.left + rink.cornerRadius;

    const isRightSide =
        correctedX >
        rink.right - rink.cornerRadius;

    const isTopSide =
        correctedY <
        rink.top + rink.cornerRadius;

    const isBottomSide =
        correctedY >
        rink.bottom - rink.cornerRadius;

    let cornerCenter = null;

    if (isLeftSide && isTopSide) {
        cornerCenter = cornerCenters[0];
    } else if (isRightSide && isTopSide) {
        cornerCenter = cornerCenters[1];
    } else if (isLeftSide && isBottomSide) {
        cornerCenter = cornerCenters[2];
    } else if (isRightSide && isBottomSide) {
        cornerCenter = cornerCenters[3];
    }

    if (cornerCenter) {
        const deltaX =
            correctedX - cornerCenter.x;

        const deltaY =
            correctedY - cornerCenter.y;

        const distance = Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

        if (
            distance >
            innerCornerRadius
        ) {
            const normalX =
                deltaX / distance;

            const normalY =
                deltaY / distance;

            const newX =
                cornerCenter.x +
                normalX * innerCornerRadius;

            const newY =
                cornerCenter.y +
                normalY * innerCornerRadius;

            hitX =
                hitX ||
                Math.abs(newX - correctedX) > 0.01;

            hitY =
                hitY ||
                Math.abs(newY - correctedY) > 0.01;

            correctedX = newX;
            correctedY = newY;
        }
    }

    return {
        x: correctedX,
        y: correctedY,
        hitX: hitX,
        hitY: hitY
    };
}