const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0d7a2b",

    input: {
        activePointers: 5
    },

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

        facingAngle: -Math.PI / 2,
        targetFacingAngle: -Math.PI / 2,
        turnSpeed: 7,

        facingX: 0,
        facingY: -1,

        controls: {
            up: false,
            down: false,
            left: false,
            right: false
        },

        keyboard: null,
        mobileButtons: [],

        aim: {
            active: false,
            pointerId: null,

            centerX: 0,
            centerY: 0,

            directionX: 0,
            directionY: -1,

            distance: 0,
            maximumDistance: 38,

            base: null,
            knob: null,
            label: null,
            guide: null
        }
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
        "Version 0.0.52",
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
        if (scene.gameState.gameStarted) {
            return;
        }

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

        updatePlayerStick(scene);
    });

    scene.input.on("pointermove", pointer => {
        updateAimPointer(scene, pointer);
    });

    scene.input.on("pointerup", pointer => {
        finishAimPointer(scene, pointer, true);
        releaseDirectionalControls(scene);
    });

    scene.input.on("pointerupoutside", pointer => {
        finishAimPointer(scene, pointer, true);
        releaseDirectionalControls(scene);
    });

    scene.input.on("gameout", () => {
        cancelAim(scene);
        releaseDirectionalControls(scene);
    });

    window.addEventListener("blur", () => {
        cancelAim(scene);
        releaseDirectionalControls(scene);
    });
}

function update(time, delta) {
    const state = this.gameState;

    if (!state || !state.gameStarted) {
        return;
    }

    const deltaSeconds = Math.min(delta / 1000, 0.05);

    updatePlayerInput(this);
    updatePlayerFacing(this, deltaSeconds);
    updatePlayerMovement(this, deltaSeconds);
    updatePuckMovement(this, deltaSeconds);
    handlePlayerPuckContact(this);
    updatePlayerStick(this);
    updateAimGuide(this);
}

/* =========================================================
   RINK
========================================================= */

function drawRink(scene, rink) {
    const graphics = scene.add.graphics();

    graphics.setDepth(1);

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

    const firstMeshY =
        goalLineY +
        netDepth * 0.33 * direction;

    const secondMeshY =
        goalLineY +
        netDepth * 0.66 * direction;

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

    const topGoalLineY =
        rink.top + goalLineInset;

    const bottomGoalLineY =
        rink.bottom - goalLineInset;

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

/* =========================================================
   PLAYER AND PUCK
========================================================= */

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

    state.player.setDepth(20);

    state.playerStick = scene.add.graphics();
    state.playerStick.setDepth(21);
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

    state.puck.setDepth(22);
}

/* =========================================================
   KEYBOARD
========================================================= */

function createKeyboardControls(scene) {
    const state = scene.gameState;

    state.keyboard = null;

    if (!scene.input || !scene.input.keyboard) {
        return;
    }

    try {
        state.keyboard =
            scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,

                w: Phaser.Input.Keyboard.KeyCodes.W,
                s: Phaser.Input.Keyboard.KeyCodes.S,
                a: Phaser.Input.Keyboard.KeyCodes.A,
                d: Phaser.Input.Keyboard.KeyCodes.D,

                space:
                    Phaser.Input.Keyboard.KeyCodes.SPACE
            });
    } catch (error) {
        console.warn(
            "Keyboard controls unavailable:",
            error
        );

        state.keyboard = null;
    }
}

/* =========================================================
   MOBILE CONTROLS
========================================================= */

function createMobileControls(scene) {
    const state = scene.gameState;
    const rink = state.rink;

    const buttonRadius = 22;
    const directionSpacing = 40;

    const controlsCenterX =
        rink.left + 72;

    const controlsCenterY =
        Math.min(
            rink.bottom - 105,
            scene.scale.height - 185
        );

    createDirectionalButton(
        scene,
        controlsCenterX,
        controlsCenterY - directionSpacing,
        "▲",
        "up",
        buttonRadius
    );

    createDirectionalButton(
        scene,
        controlsCenterX,
        controlsCenterY + directionSpacing,
        "▼",
        "down",
        buttonRadius
    );

    createDirectionalButton(
        scene,
        controlsCenterX - directionSpacing,
        controlsCenterY,
        "◀",
        "left",
        buttonRadius
    );

    createDirectionalButton(
        scene,
        controlsCenterX + directionSpacing,
        controlsCenterY,
        "▶",
        "right",
        buttonRadius
    );

    createAimControl(
        scene,
        rink.right - 62,
        controlsCenterY
    );
}

function createDirectionalButton(
    scene,
    x,
    y,
    symbol,
    controlName,
    radius
) {
    const state = scene.gameState;

    const defaultColor = 0x17375e;
    const pressedColor = 0x2f71b7;

    const button = scene.add.circle(
        x,
        y,
        radius,
        defaultColor,
        0.82
    );

    button.setStrokeStyle(
        2,
        0xffffff,
        0.9
    );

    button.setDepth(100);

    button.setInteractive(
        new Phaser.Geom.Circle(
            radius,
            radius,
            radius
        ),
        Phaser.Geom.Circle.Contains
    );

    const label = scene.add.text(
        x,
        y,
        symbol,
        {
            font: "21px Arial",
            fill: "#ffffff",
            align: "center"
        }
    )
        .setOrigin(0.5)
        .setDepth(101);

    label.setInteractive({
        useHandCursor: true
    });

    const pressButton = (
        pointer,
        localX,
        localY,
        event
    ) => {
        state.controls[controlName] = true;

        button.setFillStyle(
            pressedColor,
            0.95
        );

        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
    };

    const releaseButton = () => {
        state.controls[controlName] = false;

        button.setFillStyle(
            defaultColor,
            0.82
        );
    };

    button.on("pointerdown", pressButton);
    button.on("pointerup", releaseButton);
    button.on("pointerout", releaseButton);
    button.on("pointerupoutside", releaseButton);

    label.on("pointerdown", pressButton);
    label.on("pointerup", releaseButton);
    label.on("pointerout", releaseButton);
    label.on("pointerupoutside", releaseButton);

    state.mobileButtons.push({
        controlName: controlName,
        button: button,
        label: label,
        defaultColor: defaultColor
    });
}

function createAimControl(scene, x, y) {
    const state = scene.gameState;
    const aim = state.aim;

    aim.centerX = x;
    aim.centerY = y;

    aim.base = scene.add.circle(
        x,
        y,
        35,
        0x8f2020,
        0.84
    );

    aim.base.setStrokeStyle(
        2,
        0xffffff,
        0.95
    );

    aim.base.setDepth(100);

    aim.base.setInteractive(
        new Phaser.Geom.Circle(
            35,
            35,
            35
        ),
        Phaser.Geom.Circle.Contains
    );

    aim.knob = scene.add.circle(
        x,
        y,
        17,
        0xe04444,
        1
    );

    aim.knob.setStrokeStyle(
        2,
        0xffffff,
        0.95
    );

    aim.knob.setDepth(102);

    aim.label = scene.add.text(
        x,
        y,
        "AIM",
        {
            font: "bold 10px Arial",
            fill: "#ffffff"
        }
    )
        .setOrigin(0.5)
        .setDepth(103);

    aim.guide = scene.add.graphics();
    aim.guide.setDepth(19);

    const startAim = (
        pointer,
        localX,
        localY,
        event
    ) => {
        if (aim.active) {
            return;
        }

        aim.active = true;
        aim.pointerId = pointer.id;

        aim.base.setFillStyle(
            0xb62b2b,
            0.95
        );

        updateAimFromPointer(
            scene,
            pointer
        );

        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
    };

    aim.base.on("pointerdown", startAim);
    aim.knob.setInteractive({ useHandCursor: true });
    aim.label.setInteractive({ useHandCursor: true });

    aim.knob.on("pointerdown", startAim);
    aim.label.on("pointerdown", startAim);
}

function updateAimPointer(scene, pointer) {
    const state = scene.gameState;

    if (
        !state ||
        !state.gameStarted ||
        !state.aim.active ||
        state.aim.pointerId !== pointer.id
    ) {
        return;
    }

    updateAimFromPointer(scene, pointer);
}

function updateAimFromPointer(scene, pointer) {
    const state = scene.gameState;
    const aim = state.aim;

    let deltaX =
        pointer.x - aim.centerX;

    let deltaY =
        pointer.y - aim.centerY;

    let distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    if (distance < 0.001) {
        deltaX = state.facingX;
        deltaY = state.facingY;
        distance = 1;
    }

    const directionX = deltaX / distance;
    const directionY = deltaY / distance;

    const clampedDistance =
        Math.min(
            distance,
            aim.maximumDistance
        );

    aim.directionX = directionX;
    aim.directionY = directionY;
    aim.distance = clampedDistance;

    aim.knob.x =
        aim.centerX +
        directionX * clampedDistance;

    aim.knob.y =
        aim.centerY +
        directionY * clampedDistance;

    aim.label.x = aim.knob.x;
    aim.label.y = aim.knob.y;

    state.targetFacingAngle =
        Math.atan2(
            directionY,
            directionX
        );
}

function finishAimPointer(
    scene,
    pointer,
    shouldShoot
) {
    const state = scene.gameState;

    if (
        !state ||
        !state.aim.active ||
        state.aim.pointerId !== pointer.id
    ) {
        return;
    }

    if (shouldShoot) {
        shootPuckWithAim(scene);
    }

    resetAimControl(scene);
}

function cancelAim(scene) {
    if (
        !scene ||
        !scene.gameState ||
        !scene.gameState.aim.active
    ) {
        return;
    }

    resetAimControl(scene);
}

function resetAimControl(scene) {
    const aim = scene.gameState.aim;

    aim.active = false;
    aim.pointerId = null;
    aim.distance = 0;

    aim.knob.x = aim.centerX;
    aim.knob.y = aim.centerY;

    aim.label.x = aim.centerX;
    aim.label.y = aim.centerY;

    aim.base.setFillStyle(
        0x8f2020,
        0.84
    );

    aim.guide.clear();
}

function releaseDirectionalControls(scene) {
    if (!scene || !scene.gameState) {
        return;
    }

    const state = scene.gameState;

    state.controls.up = false;
    state.controls.down = false;
    state.controls.left = false;
    state.controls.right = false;

    for (const mobileButton of state.mobileButtons) {
        mobileButton.button.setFillStyle(
            mobileButton.defaultColor,
            0.82
        );
    }
}

/* =========================================================
   PLAYER INPUT AND MOVEMENT
========================================================= */

function updatePlayerInput(scene) {
    const state = scene.gameState;
    const keyboard = state.keyboard;

    let keyboardUp = false;
    let keyboardDown = false;
    let keyboardLeft = false;
    let keyboardRight = false;

    if (keyboard) {
        keyboardUp =
            keyboard.up.isDown ||
            keyboard.w.isDown;

        keyboardDown =
            keyboard.down.isDown ||
            keyboard.s.isDown;

        keyboardLeft =
            keyboard.left.isDown ||
            keyboard.a.isDown;

        keyboardRight =
            keyboard.right.isDown ||
            keyboard.d.isDown;
    }

    let directionX = 0;
    let directionY = 0;

    if (
        state.controls.left ||
        keyboardLeft
    ) {
        directionX -= 1;
    }

    if (
        state.controls.right ||
        keyboardRight
    ) {
        directionX += 1;
    }

    if (
        state.controls.up ||
        keyboardUp
    ) {
        directionY -= 1;
    }

    if (
        state.controls.down ||
        keyboardDown
    ) {
        directionY += 1;
    }

    if (
        directionX !== 0 ||
        directionY !== 0
    ) {
        const length = Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

        directionX /= length;
        directionY /= length;

        if (!state.aim.active) {
            state.targetFacingAngle =
                Math.atan2(
                    directionY,
                    directionX
                );
        }
    }

    state.playerVelocityX =
        directionX * state.playerSpeed;

    state.playerVelocityY =
        directionY * state.playerSpeed;

    if (
        keyboard &&
        Phaser.Input.Keyboard.JustDown(
            keyboard.space
        )
    ) {
        shootPuckInFacingDirection(scene);
    }
}

function updatePlayerFacing(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;

    let angleDifference =
        Phaser.Math.Angle.Wrap(
            state.targetFacingAngle -
            state.facingAngle
        );

    const maximumTurn =
        state.turnSpeed *
        deltaSeconds;

    angleDifference =
        Phaser.Math.Clamp(
            angleDifference,
            -maximumTurn,
            maximumTurn
        );

    state.facingAngle =
        Phaser.Math.Angle.Wrap(
            state.facingAngle +
            angleDifference
        );

    state.facingX =
        Math.cos(state.facingAngle);

    state.facingY =
        Math.sin(state.facingAngle);
}

function updatePlayerMovement(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;
    const player = state.player;

    const nextX =
        player.x +
        state.playerVelocityX *
        deltaSeconds;

    const nextY =
        player.y +
        state.playerVelocityY *
        deltaSeconds;

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

/* =========================================================
   PUCK MOVEMENT
========================================================= */

function updatePuckMovement(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;
    const puck = state.puck;

    const travelX =
        state.puckVelocityX *
        deltaSeconds;

    const travelY =
        state.puckVelocityY *
        deltaSeconds;

    const travelDistance = Math.sqrt(
        travelX * travelX +
        travelY * travelY
    );

    const movementSteps = Math.max(
        1,
        Math.ceil(travelDistance / 1.5)
    );

    for (
        let step = 0;
        step < movementSteps;
        step += 1
    ) {
        const stepX =
            state.puckVelocityX *
            deltaSeconds /
            movementSteps;

        const stepY =
            state.puckVelocityY *
            deltaSeconds /
            movementSteps;

        puck.x += stepX;
        puck.y += stepY;

        handleGoalNetCollisions(scene);

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
    }

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

/* =========================================================
   SOLID GOAL COLLISIONS
========================================================= */

function handleGoalNetCollisions(scene) {
    const state = scene.gameState;
    const rink = state.rink;
    const puck = state.puck;

    const goalLineInset = 44;
    const mouthHalfWidth = 20;
    const backHalfWidth = 14;
    const netDepth = 28;

    const topGoalLineY =
        rink.top + goalLineInset;

    const bottomGoalLineY =
        rink.bottom - goalLineInset;

    const topBackY =
        topGoalLineY - netDepth;

    const bottomBackY =
        bottomGoalLineY + netDepth;

    const topInteriorPoint = {
        x: rink.centerX,
        y: topGoalLineY - netDepth / 2
    };

    const bottomInteriorPoint = {
        x: rink.centerX,
        y: bottomGoalLineY + netDepth / 2
    };

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX - mouthHalfWidth,
        topGoalLineY,
        rink.centerX - backHalfWidth,
        topBackY,
        topInteriorPoint.x,
        topInteriorPoint.y
    );

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX + backHalfWidth,
        topBackY,
        rink.centerX + mouthHalfWidth,
        topGoalLineY,
        topInteriorPoint.x,
        topInteriorPoint.y
    );

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX - backHalfWidth,
        topBackY,
        rink.centerX + backHalfWidth,
        topBackY,
        topInteriorPoint.x,
        topInteriorPoint.y
    );

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX - backHalfWidth,
        bottomBackY,
        rink.centerX - mouthHalfWidth,
        bottomGoalLineY,
        bottomInteriorPoint.x,
        bottomInteriorPoint.y
    );

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX + mouthHalfWidth,
        bottomGoalLineY,
        rink.centerX + backHalfWidth,
        bottomBackY,
        bottomInteriorPoint.x,
        bottomInteriorPoint.y
    );

    resolveOneSidedNetSegment(
        state,
        puck,
        rink.centerX + backHalfWidth,
        bottomBackY,
        rink.centerX - backHalfWidth,
        bottomBackY,
        bottomInteriorPoint.x,
        bottomInteriorPoint.y
    );

    const postCollisionRadius =
        state.puckRadius + 3;

    const posts = [
        {
            x: rink.centerX - mouthHalfWidth,
            y: topGoalLineY
        },
        {
            x: rink.centerX + mouthHalfWidth,
            y: topGoalLineY
        },
        {
            x: rink.centerX - mouthHalfWidth,
            y: bottomGoalLineY
        },
        {
            x: rink.centerX + mouthHalfWidth,
            y: bottomGoalLineY
        }
    ];

    for (const post of posts) {
        resolvePuckCircleCollision(
            state,
            puck,
            post.x,
            post.y,
            postCollisionRadius
        );
    }
}

function resolveOneSidedNetSegment(
    state,
    puck,
    x1,
    y1,
    x2,
    y2,
    interiorX,
    interiorY
) {
    const segmentX = x2 - x1;
    const segmentY = y2 - y1;

    const segmentLengthSquared =
        segmentX * segmentX +
        segmentY * segmentY;

    if (segmentLengthSquared <= 0) {
        return;
    }

    let projection =
        (
            (puck.x - x1) * segmentX +
            (puck.y - y1) * segmentY
        ) /
        segmentLengthSquared;

    projection =
        Phaser.Math.Clamp(
            projection,
            0,
            1
        );

    const closestX =
        x1 +
        segmentX * projection;

    const closestY =
        y1 +
        segmentY * projection;

    const segmentLength =
        Math.sqrt(segmentLengthSquared);

    let normalX =
        -segmentY / segmentLength;

    let normalY =
        segmentX / segmentLength;

    const interiorDirectionX =
        interiorX - closestX;

    const interiorDirectionY =
        interiorY - closestY;

    const normalPointsInside =
        normalX * interiorDirectionX +
        normalY * interiorDirectionY;

    if (normalPointsInside < 0) {
        normalX *= -1;
        normalY *= -1;
    }

    const signedDistance =
        (
            puck.x - closestX
        ) * normalX +
        (
            puck.y - closestY
        ) * normalY;

    const collisionRadius =
        state.puckRadius + 1.5;

    if (signedDistance >= collisionRadius) {
        return;
    }

    const distanceFromClosestSquared =
        (
            puck.x - closestX
        ) *
        (
            puck.x - closestX
        ) +
        (
            puck.y - closestY
        ) *
        (
            puck.y - closestY
        );

    const endpointAllowance =
        collisionRadius *
        collisionRadius *
        1.6;

    if (
        projection === 0 ||
        projection === 1
    ) {
        if (
            distanceFromClosestSquared >
            endpointAllowance
        ) {
            return;
        }
    }

    const correction =
        collisionRadius -
        signedDistance;

    puck.x += normalX * correction;
    puck.y += normalY * correction;

    const velocityIntoWall =
        state.puckVelocityX *
        normalX +
        state.puckVelocityY *
        normalY;

    if (velocityIntoWall < 0) {
        const restitution = 0.42;

        state.puckVelocityX -=
            (1 + restitution) *
            velocityIntoWall *
            normalX;

        state.puckVelocityY -=
            (1 + restitution) *
            velocityIntoWall *
            normalY;

        state.puckVelocityX *= 0.86;
        state.puckVelocityY *= 0.86;
    }
}

function resolvePuckCircleCollision(
    state,
    puck,
    centerX,
    centerY,
    collisionRadius
) {
    const deltaX = puck.x - centerX;
    const deltaY = puck.y - centerY;

    const distanceSquared =
        deltaX * deltaX +
        deltaY * deltaY;

    if (
        distanceSquared >=
        collisionRadius * collisionRadius
    ) {
        return;
    }

    let distance =
        Math.sqrt(distanceSquared);

    let normalX;
    let normalY;

    if (distance > 0.001) {
        normalX = deltaX / distance;
        normalY = deltaY / distance;
    } else {
        normalX = 0;
        normalY = 1;
        distance = 0;
    }

    const overlap =
        collisionRadius - distance;

    puck.x += normalX * overlap;
    puck.y += normalY * overlap;

    const velocityAlongNormal =
        state.puckVelocityX *
        normalX +
        state.puckVelocityY *
        normalY;

    if (velocityAlongNormal < 0) {
        const restitution = 0.55;

        state.puckVelocityX -=
            (1 + restitution) *
            velocityAlongNormal *
            normalX;

        state.puckVelocityY -=
            (1 + restitution) *
            velocityAlongNormal *
            normalY;
    }
}

/* =========================================================
   PUCK HANDLING AND SHOOTING
========================================================= */

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

    const overlap =
        contactDistance - distance;

    puck.x += normalX * overlap;
    puck.y += normalY * overlap;

    const movementSpeed = Math.sqrt(
        state.playerVelocityX *
        state.playerVelocityX +
        state.playerVelocityY *
        state.playerVelocityY
    );

    const pushSpeed =
        34 +
        movementSpeed * 0.55;

    state.puckVelocityX =
        normalX * pushSpeed +
        state.playerVelocityX * 0.38;

    state.puckVelocityY =
        normalY * pushSpeed +
        state.playerVelocityY * 0.38;
}

function shootPuckWithAim(scene) {
    const state = scene.gameState;
    const aim = state.aim;

    const powerPercent =
        Phaser.Math.Clamp(
            aim.distance /
            aim.maximumDistance,
            0,
            1
        );

    const shotSpeed =
        220 +
        powerPercent * 230;

    shootPuckInDirection(
        scene,
        aim.directionX,
        aim.directionY,
        shotSpeed
    );
}

function shootPuckInFacingDirection(scene) {
    const state = scene.gameState;

    shootPuckInDirection(
        scene,
        state.facingX,
        state.facingY,
        350
    );
}

function shootPuckInDirection(
    scene,
    directionX,
    directionY,
    shotSpeed
) {
    const state = scene.gameState;

    const player = state.player;
    const puck = state.puck;

    const deltaX = puck.x - player.x;
    const deltaY = puck.y - player.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    const shootingDistance =
        state.playerRadius +
        state.puckRadius +
        30;

    if (distance > shootingDistance) {
        return;
    }

    const directionLength = Math.sqrt(
        directionX * directionX +
        directionY * directionY
    );

    if (directionLength < 0.001) {
        return;
    }

    directionX /= directionLength;
    directionY /= directionLength;

    const puckDirectionX =
        distance > 0.001
            ? deltaX / distance
            : directionX;

    const puckDirectionY =
        distance > 0.001
            ? deltaY / distance
            : directionY;

    const aimDotPuck =
        directionX * puckDirectionX +
        directionY * puckDirectionY;

    if (aimDotPuck < -0.25) {
        return;
    }

    const placementDistance =
        state.playerRadius +
        state.puckRadius +
        9;

    puck.x =
        player.x +
        directionX *
        placementDistance;

    puck.y =
        player.y +
        directionY *
        placementDistance;

    state.puckVelocityX =
        directionX *
        shotSpeed +
        state.playerVelocityX *
        0.18;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        state.playerVelocityY *
        0.18;
}

/* =========================================================
   STICK AND AIM GUIDE
========================================================= */

function updatePlayerStick(scene) {
    const state = scene.gameState;

    const player = state.player;
    const stick = state.playerStick;

    if (!player || !stick) {
        return;
    }

    const perpendicularX =
        -state.facingY;

    const perpendicularY =
        state.facingX;

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
        bladeX +
        perpendicularX * 8,
        bladeY +
        perpendicularY * 8
    );
}

function updateAimGuide(scene) {
    const state = scene.gameState;
    const aim = state.aim;

    if (!aim.guide) {
        return;
    }

    aim.guide.clear();

    if (!aim.active) {
        return;
    }

    const player = state.player;

    const powerPercent =
        Phaser.Math.Clamp(
            aim.distance /
            aim.maximumDistance,
            0,
            1
        );

    const guideLength =
        45 +
        powerPercent * 60;

    const startX =
        player.x +
        aim.directionX * 20;

    const startY =
        player.y +
        aim.directionY * 20;

    const endX =
        player.x +
        aim.directionX * guideLength;

    const endY =
        player.y +
        aim.directionY * guideLength;

    aim.guide.lineStyle(
        3,
        0xff3b30,
        0.72
    );

    aim.guide.lineBetween(
        startX,
        startY,
        endX,
        endY
    );

    aim.guide.fillStyle(
        0xff3b30,
        0.85
    );

    aim.guide.fillCircle(
        endX,
        endY,
        3
    );
}

/* =========================================================
   ROUNDED RINK COLLISION
========================================================= */

function clampPointInsideRoundedRink(
    x,
    y,
    objectRadius,
    rink
) {
    const insetLeft =
        rink.left +
        objectRadius +
        4;

    const insetRight =
        rink.right -
        objectRadius -
        4;

    const insetTop =
        rink.top +
        objectRadius +
        4;

    const insetBottom =
        rink.bottom -
        objectRadius -
        4;

    const innerCornerRadius =
        Math.max(
            rink.cornerRadius -
            objectRadius -
            4,
            1
        );

    let correctedX =
        Phaser.Math.Clamp(
            x,
            insetLeft,
            insetRight
        );

    let correctedY =
        Phaser.Math.Clamp(
            y,
            insetTop,
            insetBottom
        );

    let hitX = correctedX !== x;
    let hitY = correctedY !== y;

    const isLeftSide =
        correctedX <
        rink.left +
        rink.cornerRadius;

    const isRightSide =
        correctedX >
        rink.right -
        rink.cornerRadius;

    const isTopSide =
        correctedY <
        rink.top +
        rink.cornerRadius;

    const isBottomSide =
        correctedY >
        rink.bottom -
        rink.cornerRadius;

    let cornerCenter = null;

    if (isLeftSide && isTopSide) {
        cornerCenter = {
            x:
                rink.left +
                rink.cornerRadius,

            y:
                rink.top +
                rink.cornerRadius
        };
    } else if (
        isRightSide &&
        isTopSide
    ) {
        cornerCenter = {
            x:
                rink.right -
                rink.cornerRadius,

            y:
                rink.top +
                rink.cornerRadius
        };
    } else if (
        isLeftSide &&
        isBottomSide
    ) {
        cornerCenter = {
            x:
                rink.left +
                rink.cornerRadius,

            y:
                rink.bottom -
                rink.cornerRadius
        };
    } else if (
        isRightSide &&
        isBottomSide
    ) {
        cornerCenter = {
            x:
                rink.right -
                rink.cornerRadius,

            y:
                rink.bottom -
                rink.cornerRadius
        };
    }

    if (cornerCenter) {
        const deltaX =
            correctedX -
            cornerCenter.x;

        const deltaY =
            correctedY -
            cornerCenter.y;

        const distance = Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

        if (
            distance >
            innerCornerRadius &&
            distance > 0
        ) {
            const normalX =
                deltaX / distance;

            const normalY =
                deltaY / distance;

            const newX =
                cornerCenter.x +
                normalX *
                innerCornerRadius;

            const newY =
                cornerCenter.y +
                normalY *
                innerCornerRadius;

            hitX =
                hitX ||
                Math.abs(
                    newX -
                    correctedX
                ) > 0.01;

            hitY =
                hitY ||
                Math.abs(
                    newY -
                    correctedY
                ) > 0.01;

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