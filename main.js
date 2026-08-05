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
        create,
        update
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
        rink,
        gameStarted: false,

        player: null,
        playerStick: null,
        puck: null,

        playerRadius: 11,
        puckRadius: 5,

        playerVelocityX: 0,
        playerVelocityY: 0,

        puckVelocityX: 0,
        puckVelocityY: 0,

        normalMaximumSpeed: 150,
        sprintMaximumSpeed: 225,

        playerAcceleration: 650,
        sprintAcceleration: 525,
        playerDeceleration: 820,

        sprinting: false,
        sprintButton: null,
        sprintLabel: null,

        puckFriction: 0.985,

        facingAngle: -Math.PI / 2,
        targetFacingAngle: -Math.PI / 2,

        facingX: 0,
        facingY: -1,

        turnSpeed: 8,

        keyboard: null,

        movement: {
            active: false,
            pointerId: null,

            centerX: 0,
            centerY: 0,

            directionX: 0,
            directionY: 0,

            strength: 0,

            baseRadius: 38,
            knobRadius: 18,
            maximumDistance: 34,

            base: null,
            knob: null
        },

        aim: {
            active: false,
            pointerId: null,

            centerX: 0,
            centerY: 0,

            directionX: 0,
            directionY: -1,

            strength: 0,
            distance: 0,

            baseRadius: 38,
            knobRadius: 18,
            maximumDistance: 34,

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
        "Version 0.0.54",
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
        updateMovementPointer(scene, pointer);
        updateAimPointer(scene, pointer);
    });

    scene.input.on("pointerup", pointer => {
        finishMovementPointer(scene, pointer);
        finishAimPointer(scene, pointer, true);
        releaseSprintPointer(scene, pointer);
    });

    scene.input.on("pointerupoutside", pointer => {
        finishMovementPointer(scene, pointer);
        finishAimPointer(scene, pointer, true);
        releaseSprintPointer(scene, pointer);
    });

    scene.input.on("gameout", () => {
        cancelAllControls(scene);
    });

    window.addEventListener("blur", () => {
        cancelAllControls(scene);
    });
}

function update(time, delta) {
    const state = this.gameState;

    if (!state || !state.gameStarted) {
        return;
    }

    const deltaSeconds = Math.min(
        delta / 1000,
        0.05
    );

    updateKeyboardInput(this);
    updatePlayerVelocity(this, deltaSeconds);
    updatePlayerFacing(this, deltaSeconds);
    updatePlayerMovement(this, deltaSeconds);

    updatePuckMovement(this, deltaSeconds);
    updatePuckControl(this, deltaSeconds);

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
    const circleRadius = 34;

    const leftX = rink.centerX - 85;
    const rightX = rink.centerX + 85;

    const topY = rink.centerY - 215;
    const bottomY = rink.centerY + 215;

    graphics.lineStyle(2, 0xff3b30, 1);

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

    drawFaceoffDot(graphics, leftX, topY, 3);
    drawFaceoffDot(graphics, rightX, topY, 3);
    drawFaceoffDot(graphics, leftX, bottomY, 3);
    drawFaceoffDot(graphics, rightX, bottomY, 3);

    drawFaceoffDot(
        graphics,
        rink.centerX - 95,
        rink.centerY - 75,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 95,
        rink.centerY - 75,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX - 95,
        rink.centerY + 75,
        3
    );

    drawFaceoffDot(
        graphics,
        rink.centerX + 95,
        rink.centerY + 75,
        3
    );
}

function drawFaceoffCircle(
    graphics,
    x,
    y,
    radius
) {
    graphics.strokeCircle(x, y, radius);

    drawCircleHashes(
        graphics,
        x,
        y,
        radius
    );

    drawFaceoffLMarks(
        graphics,
        x,
        y
    );
}

function drawCircleHashes(
    graphics,
    x,
    y,
    radius
) {
    const outsideLength = 5;
    const insideLength = 2;
    const gap = 5;

    const lines = [
        [
            x - gap,
            y - radius - outsideLength,
            x - gap,
            y - radius + insideLength
        ],
        [
            x + gap,
            y - radius - outsideLength,
            x + gap,
            y - radius + insideLength
        ],
        [
            x - gap,
            y + radius - insideLength,
            x - gap,
            y + radius + outsideLength
        ],
        [
            x + gap,
            y + radius - insideLength,
            x + gap,
            y + radius + outsideLength
        ],
        [
            x - radius - outsideLength,
            y - gap,
            x - radius + insideLength,
            y - gap
        ],
        [
            x - radius - outsideLength,
            y + gap,
            x - radius + insideLength,
            y + gap
        ],
        [
            x + radius - insideLength,
            y - gap,
            x + radius + outsideLength,
            y - gap
        ],
        [
            x + radius - insideLength,
            y + gap,
            x + radius + outsideLength,
            y + gap
        ]
    ];

    for (const line of lines) {
        graphics.lineBetween(
            line[0],
            line[1],
            line[2],
            line[3]
        );
    }
}

function drawFaceoffLMarks(graphics, x, y) {
    const horizontalOffset = 11;
    const verticalOffset = 8;
    const markLength = 6;

    const corners = [
        {
            x: x - horizontalOffset,
            y: y - verticalOffset,
            horizontalDirection: 1,
            verticalDirection: 1
        },
        {
            x: x + horizontalOffset,
            y: y - verticalOffset,
            horizontalDirection: -1,
            verticalDirection: 1
        },
        {
            x: x - horizontalOffset,
            y: y + verticalOffset,
            horizontalDirection: 1,
            verticalDirection: -1
        },
        {
            x: x + horizontalOffset,
            y: y + verticalOffset,
            horizontalDirection: -1,
            verticalDirection: -1
        }
    ];

    for (const corner of corners) {
        graphics.lineBetween(
            corner.x,
            corner.y,
            corner.x +
                markLength *
                corner.horizontalDirection,
            corner.y
        );

        graphics.lineBetween(
            corner.x,
            corner.y,
            corner.x,
            corner.y +
                markLength *
                corner.verticalDirection
        );
    }
}

function drawFaceoffDot(
    graphics,
    x,
    y,
    radius
) {
    graphics.fillCircle(x, y, radius);
}

function drawGoalsAndCreases(
    graphics,
    rink
) {
    const goalLineInset = 44;

    const topGoalLineY =
        rink.top + goalLineInset;

    const bottomGoalLineY =
        rink.bottom - goalLineInset;

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

function drawGoalCrease(
    graphics,
    centerX,
    goalLineY,
    side
) {
    const creaseHalfWidth = 34;
    const creaseDepth = 32;

    const direction =
        side === "top"
            ? 1
            : -1;

    graphics.fillStyle(
        0xbfe9ff,
        0.75
    );

    graphics.lineStyle(
        3,
        0x4fc3ff,
        1
    );

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

    graphics.lineStyle(
        2,
        0x4fc3ff,
        1
    );

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

function drawGoalNet(
    graphics,
    centerX,
    goalLineY,
    side
) {
    const direction =
        side === "top"
            ? -1
            : 1;

    const mouthHalfWidth = 20;
    const backHalfWidth = 14;
    const netDepth = 28;

    const backY =
        goalLineY +
        netDepth * direction;

    const firstMeshY =
        goalLineY +
        netDepth *
        0.33 *
        direction;

    const secondMeshY =
        goalLineY +
        netDepth *
        0.66 *
        direction;

    graphics.lineStyle(
        1,
        0x9fb3c8,
        0.95
    );

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

    const verticalOffsets = [
        -12,
        -6,
        0,
        6,
        12
    ];

    for (const offset of verticalOffsets) {
        const backOffset =
            offset * 0.75;

        graphics.lineBetween(
            centerX + offset,
            goalLineY,
            centerX + backOffset,
            backY
        );
    }

    graphics.lineStyle(
        4,
        0xff3b30,
        1
    );

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

function drawGoalieTrapezoids(
    graphics,
    rink
) {
    const goalLineInset = 44;

    const topGoalLineY =
        rink.top + goalLineInset;

    const bottomGoalLineY =
        rink.bottom - goalLineInset;

    const innerHalfWidth = 30;
    const outerHalfWidth = 48;

    graphics.lineStyle(
        2,
        0xff3b30,
        1
    );

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

function drawRefereeCrease(
    graphics,
    rink
) {
    graphics.lineStyle(
        2,
        0xff3b30,
        1
    );

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

    state.playerStick =
        scene.add.graphics();

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
   MOBILE CONTROLS
========================================================= */

function createMobileControls(scene) {
    const state = scene.gameState;
    const rink = state.rink;

    const controlsY = Math.min(
        rink.bottom - 105,
        scene.scale.height - 185
    );

    const movementX = rink.left + 70;
    const aimX = rink.right - 70;

    createMovementJoystick(
        scene,
        movementX,
        controlsY
    );

    createAimJoystick(
        scene,
        aimX,
        controlsY
    );

    createSprintButton(
        scene,
        movementX,
        controlsY - 72
    );
}

function createMovementJoystick(
    scene,
    x,
    y
) {
    const movement =
        scene.gameState.movement;

    movement.centerX = x;
    movement.centerY = y;

    movement.base = scene.add.circle(
        x,
        y,
        movement.baseRadius,
        0x17375e,
        0.72
    );

    movement.base.setStrokeStyle(
        2,
        0xffffff,
        0.85
    );

    movement.base.setDepth(100);

    movement.knob = scene.add.circle(
        x,
        y,
        movement.knobRadius,
        0x2f71b7,
        0.95
    );

    movement.knob.setStrokeStyle(
        2,
        0xffffff,
        0.95
    );

    movement.knob.setDepth(101);

    const hitArea = scene.add.circle(
        x,
        y,
        movement.baseRadius + 12,
        0xffffff,
        0.001
    );

    hitArea.setDepth(102);

    hitArea.setInteractive(
        new Phaser.Geom.Circle(
            movement.baseRadius + 12,
            movement.baseRadius + 12,
            movement.baseRadius + 12
        ),
        Phaser.Geom.Circle.Contains
    );

    hitArea.on(
        "pointerdown",
        pointer => {
            if (movement.active) {
                return;
            }

            movement.active = true;
            movement.pointerId = pointer.id;

            movement.base.setFillStyle(
                0x234f7f,
                0.84
            );

            updateMovementFromPointer(
                scene,
                pointer
            );
        }
    );
}

function createAimJoystick(
    scene,
    x,
    y
) {
    const aim = scene.gameState.aim;

    aim.centerX = x;
    aim.centerY = y;

    aim.base = scene.add.circle(
        x,
        y,
        aim.baseRadius,
        0x8f2020,
        0.74
    );

    aim.base.setStrokeStyle(
        2,
        0xffffff,
        0.85
    );

    aim.base.setDepth(100);

    aim.knob = scene.add.circle(
        x,
        y,
        aim.knobRadius,
        0xe04444,
        0.98
    );

    aim.knob.setStrokeStyle(
        2,
        0xffffff,
        0.95
    );

    aim.knob.setDepth(101);

    aim.label = scene.add.text(
        x,
        y,
        "SHOT",
        {
            font: "bold 9px Arial",
            fill: "#ffffff"
        }
    )
        .setOrigin(0.5)
        .setDepth(102);

    aim.guide = scene.add.graphics();
    aim.guide.setDepth(19);

    const hitArea = scene.add.circle(
        x,
        y,
        aim.baseRadius + 12,
        0xffffff,
        0.001
    );

    hitArea.setDepth(103);

    hitArea.setInteractive(
        new Phaser.Geom.Circle(
            aim.baseRadius + 12,
            aim.baseRadius + 12,
            aim.baseRadius + 12
        ),
        Phaser.Geom.Circle.Contains
    );

    hitArea.on(
        "pointerdown",
        pointer => {
            if (aim.active) {
                return;
            }

            aim.active = true;
            aim.pointerId = pointer.id;

            aim.base.setFillStyle(
                0xb62b2b,
                0.9
            );

            updateAimFromPointer(
                scene,
                pointer
            );
        }
    );
}

function createSprintButton(
    scene,
    x,
    y
) {
    const state = scene.gameState;

    const button = scene.add.circle(
        x,
        y,
        27,
        0x1769d2,
        0.85
    );

    button.setStrokeStyle(
        2,
        0xffffff,
        0.9
    );

    button.setDepth(105);

    const label = scene.add.text(
        x,
        y,
        "SPRINT",
        {
            font: "bold 9px Arial",
            fill: "#ffffff"
        }
    )
        .setOrigin(0.5)
        .setDepth(106);

    const hitArea = scene.add.circle(
        x,
        y,
        34,
        0xffffff,
        0.001
    );

    hitArea.setDepth(107);

    hitArea.setInteractive(
        new Phaser.Geom.Circle(
            34,
            34,
            34
        ),
        Phaser.Geom.Circle.Contains
    );

    state.sprintButton = {
        button,
        label,
        hitArea,
        pointerId: null
    };

    hitArea.on(
        "pointerdown",
        pointer => {
            if (
                state.sprintButton.pointerId !==
                null
            ) {
                return;
            }

            state.sprintButton.pointerId =
                pointer.id;

            state.sprinting = true;

            button.setFillStyle(
                0x4ba3ff,
                0.98
            );

            button.setScale(1.08);
            label.setScale(1.08);
        }
    );
}

function releaseSprintPointer(
    scene,
    pointer
) {
    const state = scene.gameState;

    if (
        !state.sprintButton ||
        state.sprintButton.pointerId !==
            pointer.id
    ) {
        return;
    }

    resetSprintButton(scene);
}

function resetSprintButton(scene) {
    const state = scene.gameState;

    state.sprinting = false;

    if (!state.sprintButton) {
        return;
    }

    state.sprintButton.pointerId = null;

    state.sprintButton.button.setFillStyle(
        0x1769d2,
        0.85
    );

    state.sprintButton.button.setScale(1);
    state.sprintButton.label.setScale(1);
}

/* =========================================================
   JOYSTICK POINTERS
========================================================= */

function updateMovementPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    if (
        !movement.active ||
        movement.pointerId !== pointer.id
    ) {
        return;
    }

    updateMovementFromPointer(
        scene,
        pointer
    );
}

function updateMovementFromPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    const deltaX =
        pointer.x -
        movement.centerX;

    const deltaY =
        pointer.y -
        movement.centerY;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    if (distance < 3) {
        movement.directionX = 0;
        movement.directionY = 0;
        movement.strength = 0;

        movement.knob.x =
            movement.centerX;

        movement.knob.y =
            movement.centerY;

        return;
    }

    const directionX =
        deltaX / distance;

    const directionY =
        deltaY / distance;

    const clampedDistance = Math.min(
        distance,
        movement.maximumDistance
    );

    movement.directionX = directionX;
    movement.directionY = directionY;

    movement.strength =
        Phaser.Math.Clamp(
            clampedDistance /
                movement.maximumDistance,
            0,
            1
        );

    movement.knob.x =
        movement.centerX +
        directionX *
        clampedDistance;

    movement.knob.y =
        movement.centerY +
        directionY *
        clampedDistance;
}

function finishMovementPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    if (
        !movement.active ||
        movement.pointerId !== pointer.id
    ) {
        return;
    }

    resetMovementJoystick(scene);
}

function resetMovementJoystick(scene) {
    const movement =
        scene.gameState.movement;

    movement.active = false;
    movement.pointerId = null;

    movement.directionX = 0;
    movement.directionY = 0;
    movement.strength = 0;

    if (!movement.knob || !movement.base) {
        return;
    }

    movement.knob.x =
        movement.centerX;

    movement.knob.y =
        movement.centerY;

    movement.base.setFillStyle(
        0x17375e,
        0.72
    );
}

function updateAimPointer(
    scene,
    pointer
) {
    const aim = scene.gameState.aim;

    if (
        !aim.active ||
        aim.pointerId !== pointer.id
    ) {
        return;
    }

    updateAimFromPointer(
        scene,
        pointer
    );
}

function updateAimFromPointer(
    scene,
    pointer
) {
    const state = scene.gameState;
    const aim = state.aim;

    const deltaX =
        pointer.x - aim.centerX;

    const deltaY =
        pointer.y - aim.centerY;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    if (distance < 3) {
        aim.directionX =
            state.facingX;

        aim.directionY =
            state.facingY;

        aim.distance = 0;
        aim.strength = 0;

        aim.knob.x = aim.centerX;
        aim.knob.y = aim.centerY;

        aim.label.x = aim.centerX;
        aim.label.y = aim.centerY;

        return;
    }

    const directionX =
        deltaX / distance;

    const directionY =
        deltaY / distance;

    const clampedDistance = Math.min(
        distance,
        aim.maximumDistance
    );

    aim.directionX = directionX;
    aim.directionY = directionY;
    aim.distance = clampedDistance;

    aim.strength =
        Phaser.Math.Clamp(
            clampedDistance /
                aim.maximumDistance,
            0,
            1
        );

    aim.knob.x =
        aim.centerX +
        directionX *
        clampedDistance;

    aim.knob.y =
        aim.centerY +
        directionY *
        clampedDistance;

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
    const aim = scene.gameState.aim;

    if (
        !aim.active ||
        aim.pointerId !== pointer.id
    ) {
        return;
    }

    if (
        shouldShoot &&
        aim.strength > 0.12
    ) {
        shootPuckWithAim(scene);
    }

    resetAimJoystick(scene);
}

function resetAimJoystick(scene) {
    const aim = scene.gameState.aim;

    aim.active = false;
    aim.pointerId = null;

    aim.distance = 0;
    aim.strength = 0;

    if (
        !aim.knob ||
        !aim.label ||
        !aim.base
    ) {
        return;
    }

    aim.knob.x = aim.centerX;
    aim.knob.y = aim.centerY;

    aim.label.x = aim.centerX;
    aim.label.y = aim.centerY;

    aim.base.setFillStyle(
        0x8f2020,
        0.74
    );

    if (aim.guide) {
        aim.guide.clear();
    }
}

function cancelAllControls(scene) {
    if (
        !scene ||
        !scene.gameState
    ) {
        return;
    }

    resetMovementJoystick(scene);
    resetAimJoystick(scene);
    resetSprintButton(scene);
}

/* =========================================================
   KEYBOARD
========================================================= */

function createKeyboardControls(scene) {
    const state = scene.gameState;

    if (
        !scene.input ||
        !scene.input.keyboard
    ) {
        return;
    }

    try {
        state.keyboard =
            scene.input.keyboard.addKeys({
                up:
                    Phaser.Input.Keyboard
                        .KeyCodes.UP,

                down:
                    Phaser.Input.Keyboard
                        .KeyCodes.DOWN,

                left:
                    Phaser.Input.Keyboard
                        .KeyCodes.LEFT,

                right:
                    Phaser.Input.Keyboard
                        .KeyCodes.RIGHT,

                w:
                    Phaser.Input.Keyboard
                        .KeyCodes.W,

                s:
                    Phaser.Input.Keyboard
                        .KeyCodes.S,

                a:
                    Phaser.Input.Keyboard
                        .KeyCodes.A,

                d:
                    Phaser.Input.Keyboard
                        .KeyCodes.D,

                shift:
                    Phaser.Input.Keyboard
                        .KeyCodes.SHIFT,

                space:
                    Phaser.Input.Keyboard
                        .KeyCodes.SPACE
            });
    } catch (error) {
        console.warn(
            "Keyboard controls unavailable:",
            error
        );

        state.keyboard = null;
    }
}

function updateKeyboardInput(scene) {
    const state = scene.gameState;
    const keyboard = state.keyboard;

    if (!keyboard) {
        return;
    }

    let directionX = 0;
    let directionY = 0;

    if (
        keyboard.left.isDown ||
        keyboard.a.isDown
    ) {
        directionX -= 1;
    }

    if (
        keyboard.right.isDown ||
        keyboard.d.isDown
    ) {
        directionX += 1;
    }

    if (
        keyboard.up.isDown ||
        keyboard.w.isDown
    ) {
        directionY -= 1;
    }

    if (
        keyboard.down.isDown ||
        keyboard.s.isDown
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

        state.movement.directionX =
            directionX / length;

        state.movement.directionY =
            directionY / length;

        state.movement.strength = 1;

        if (!state.aim.active) {
            state.targetFacingAngle =
                Math.atan2(
                    state.movement.directionY,
                    state.movement.directionX
                );
        }
    } else if (!state.movement.active) {
        state.movement.directionX = 0;
        state.movement.directionY = 0;
        state.movement.strength = 0;
    }

    if (
        state.sprintButton?.pointerId ===
        null
    ) {
        state.sprinting =
            keyboard.shift.isDown;
    }

    if (
        Phaser.Input.Keyboard.JustDown(
            keyboard.space
        )
    ) {
        shootPuckInDirection(
            scene,
            state.facingX,
            state.facingY,
            365
        );
    }
}

/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayerVelocity(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;
    const movement = state.movement;

    const maximumSpeed =
        state.sprinting
            ? state.sprintMaximumSpeed
            : state.normalMaximumSpeed;

    const acceleration =
        state.sprinting
            ? state.sprintAcceleration
            : state.playerAcceleration;

    const targetVelocityX =
        movement.directionX *
        maximumSpeed *
        movement.strength;

    const targetVelocityY =
        movement.directionY *
        maximumSpeed *
        movement.strength;

    const hasInput =
        movement.strength > 0.01;

    const changeRate =
        hasInput
            ? acceleration
            : state.playerDeceleration;

    state.playerVelocityX =
        moveToward(
            state.playerVelocityX,
            targetVelocityX,
            changeRate * deltaSeconds
        );

    state.playerVelocityY =
        moveToward(
            state.playerVelocityY,
            targetVelocityY,
            changeRate * deltaSeconds
        );

    if (
        hasInput &&
        !state.aim.active
    ) {
        state.targetFacingAngle =
            Math.atan2(
                movement.directionY,
                movement.directionX
            );
    }
}

function moveToward(
    current,
    target,
    maximumChange
) {
    if (
        Math.abs(target - current) <=
        maximumChange
    ) {
        return target;
    }

    return (
        current +
        Math.sign(target - current) *
        maximumChange
    );
}

function updatePlayerFacing(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;

    const difference =
        Phaser.Math.Angle.Wrap(
            state.targetFacingAngle -
            state.facingAngle
        );

    const sprintTurnMultiplier =
        state.sprinting
            ? 0.78
            : 1;

    const maximumTurn =
        state.turnSpeed *
        sprintTurnMultiplier *
        deltaSeconds;

    state.facingAngle =
        Phaser.Math.Angle.Wrap(
            state.facingAngle +
            Phaser.Math.Clamp(
                difference,
                -maximumTurn,
                maximumTurn
            )
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

    const corrected =
        clampPointInsideRoundedRink(
            nextX,
            nextY,
            state.playerRadius,
            state.rink
        );

    player.x = corrected.x;
    player.y = corrected.y;

    if (corrected.hitX) {
        state.playerVelocityX = 0;
    }

    if (corrected.hitY) {
        state.playerVelocityY = 0;
    }
}

/* =========================================================
   STICK AND PUCK CONTROL
========================================================= */

function getStickBladePosition(state) {
    const player = state.player;

    const perpendicularX =
        -state.facingY;

    const perpendicularY =
        state.facingX;

    return {
        x:
            player.x +
            state.facingX * 25 +
            perpendicularX * 8,

        y:
            player.y +
            state.facingY * 25 +
            perpendicularY * 8,

        perpendicularX,
        perpendicularY
    };
}

function updatePlayerStick(scene) {
    const state = scene.gameState;

    if (
        !state.player ||
        !state.playerStick
    ) {
        return;
    }

    const blade =
        getStickBladePosition(state);

    const handX =
        state.player.x +
        state.facingX * 6 +
        blade.perpendicularX * 6;

    const handY =
        state.player.y +
        state.facingY * 6 +
        blade.perpendicularY * 6;

    state.playerStick.clear();

    state.playerStick.lineStyle(
        3,
        0x6e4524,
        1
    );

    state.playerStick.lineBetween(
        handX,
        handY,
        blade.x,
        blade.y
    );

    state.playerStick.lineStyle(
        4,
        0x222222,
        1
    );

    state.playerStick.lineBetween(
        blade.x,
        blade.y,
        blade.x +
            blade.perpendicularX * 8,
        blade.y +
            blade.perpendicularY * 8
    );
}

function updatePuckControl(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;

    const puck = state.puck;
    const blade =
        getStickBladePosition(state);

    const deltaX =
        puck.x - blade.x;

    const deltaY =
        puck.y - blade.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    const puckSpeed = Math.sqrt(
        state.puckVelocityX *
        state.puckVelocityX +
        state.puckVelocityY *
        state.puckVelocityY
    );

    const controlDistance = 15;

    if (
        distance > controlDistance ||
        puckSpeed > 220
    ) {
        handlePlayerPuckCollision(scene);
        return;
    }

    const controlStrength = Math.min(
        deltaSeconds * 9,
        1
    );

    puck.x =
        Phaser.Math.Linear(
            puck.x,
            blade.x,
            controlStrength
        );

    puck.y =
        Phaser.Math.Linear(
            puck.y,
            blade.y,
            controlStrength
        );

    state.puckVelocityX =
        Phaser.Math.Linear(
            state.puckVelocityX,
            state.playerVelocityX,
            controlStrength
        );

    state.puckVelocityY =
        Phaser.Math.Linear(
            state.puckVelocityY,
            state.playerVelocityY,
            controlStrength
        );
}

function handlePlayerPuckCollision(scene) {
    const state = scene.gameState;

    const deltaX =
        state.puck.x -
        state.player.x;

    const deltaY =
        state.puck.y -
        state.player.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    const minimumDistance =
        state.playerRadius +
        state.puckRadius +
        2;

    if (
        distance >= minimumDistance ||
        distance < 0.001
    ) {
        return;
    }

    const normalX =
        deltaX / distance;

    const normalY =
        deltaY / distance;

    const overlap =
        minimumDistance -
        distance;

    state.puck.x +=
        normalX * overlap;

    state.puck.y +=
        normalY * overlap;

    state.puckVelocityX +=
        normalX * 20 +
        state.playerVelocityX * 0.15;

    state.puckVelocityY +=
        normalY * 20 +
        state.playerVelocityY * 0.15;
}

/* =========================================================
   AIMING AND SHOOTING
========================================================= */

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

    const blade =
        getStickBladePosition(state);

    const guideLength =
        55 +
        aim.strength * 75;

    const endX =
        blade.x +
        aim.directionX *
        guideLength;

    const endY =
        blade.y +
        aim.directionY *
        guideLength;

    const canShoot =
        isPuckShootable(state);

    aim.guide.lineStyle(
        3,
        canShoot
            ? 0xffd21f
            : 0xff3b30,
        0.85
    );

    aim.guide.lineBetween(
        blade.x,
        blade.y,
        endX,
        endY
    );

    aim.guide.fillStyle(
        canShoot
            ? 0xffd21f
            : 0xff3b30,
        0.9
    );

    aim.guide.fillTriangle(
        endX,
        endY,

        endX -
            aim.directionX * 10 -
            aim.directionY * 5,

        endY -
            aim.directionY * 10 +
            aim.directionX * 5,

        endX -
            aim.directionX * 10 +
            aim.directionY * 5,

        endY -
            aim.directionY * 10 -
            aim.directionX * 5
    );
}

function isPuckShootable(state) {
    const blade =
        getStickBladePosition(state);

    const deltaX =
        state.puck.x - blade.x;

    const deltaY =
        state.puck.y - blade.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    return distance <= 18;
}

function shootPuckWithAim(scene) {
    const state = scene.gameState;
    const aim = state.aim;

    const shotSpeed =
        230 +
        aim.strength * 240;

    shootPuckInDirection(
        scene,
        aim.directionX,
        aim.directionY,
        shotSpeed
    );
}

function shootPuckInDirection(
    scene,
    directionX,
    directionY,
    shotSpeed
) {
    const state = scene.gameState;

    if (!isPuckShootable(state)) {
        return;
    }

    const length = Math.sqrt(
        directionX * directionX +
        directionY * directionY
    );

    if (length < 0.001) {
        return;
    }

    directionX /= length;
    directionY /= length;

    /*
     * Important:
     * The puck is NOT teleported to the other
     * side of the blade anymore.
     *
     * Only its velocity changes. This prevents
     * shots near a post from snapping into the net.
     */

    state.puckVelocityX =
        directionX *
        shotSpeed +
        state.playerVelocityX *
        0.1;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        state.playerVelocityY *
        0.1;
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

    const steps = Math.max(
        1,
        Math.ceil(
            travelDistance / 1
        )
    );

    for (
        let step = 0;
        step < steps;
        step += 1
    ) {
        puck.x +=
            state.puckVelocityX *
            deltaSeconds /
            steps;

        puck.y +=
            state.puckVelocityY *
            deltaSeconds /
            steps;

        handleGoalNetCollisions(scene);

        const corrected =
            clampPointInsideRoundedRink(
                puck.x,
                puck.y,
                state.puckRadius,
                state.rink
            );

        if (corrected.hitX) {
            state.puckVelocityX *= -0.55;
        }

        if (corrected.hitY) {
            state.puckVelocityY *= -0.55;
        }

        puck.x = corrected.x;
        puck.y = corrected.y;
    }

    const frameFriction = Math.pow(
        state.puckFriction,
        deltaSeconds * 60
    );

    state.puckVelocityX *=
        frameFriction;

    state.puckVelocityY *=
        frameFriction;

    if (
        Math.abs(
            state.puckVelocityX
        ) < 0.4
    ) {
        state.puckVelocityX = 0;
    }

    if (
        Math.abs(
            state.puckVelocityY
        ) < 0.4
    ) {
        state.puckVelocityY = 0;
    }
}

/* =========================================================
   GOAL COLLISIONS
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

    /*
     * Posts are resolved first.
     *
     * If a post was hit, we do not immediately
     * resolve the adjoining net walls during the
     * same physics step. This prevents the wall
     * from pulling the puck into the goal.
     */

    const posts = [
        [
            rink.centerX - mouthHalfWidth,
            topGoalLineY
        ],
        [
            rink.centerX + mouthHalfWidth,
            topGoalLineY
        ],
        [
            rink.centerX - mouthHalfWidth,
            bottomGoalLineY
        ],
        [
            rink.centerX + mouthHalfWidth,
            bottomGoalLineY
        ]
    ];

    let postWasHit = false;

    for (const post of posts) {
        const hit =
            resolvePuckPostCollision(
                state,
                puck,
                post[0],
                post[1]
            );

        if (hit) {
            postWasHit = true;
        }
    }

    if (postWasHit) {
        return;
    }

    const topInterior = {
        x: rink.centerX,
        y:
            topGoalLineY -
            netDepth / 2
    };

    const bottomInterior = {
        x: rink.centerX,
        y:
            bottomGoalLineY +
            netDepth / 2
    };

    const segments = [
        [
            rink.centerX - mouthHalfWidth,
            topGoalLineY,
            rink.centerX - backHalfWidth,
            topBackY,
            topInterior.x,
            topInterior.y
        ],
        [
            rink.centerX + backHalfWidth,
            topBackY,
            rink.centerX + mouthHalfWidth,
            topGoalLineY,
            topInterior.x,
            topInterior.y
        ],
        [
            rink.centerX - backHalfWidth,
            topBackY,
            rink.centerX + backHalfWidth,
            topBackY,
            topInterior.x,
            topInterior.y
        ],
        [
            rink.centerX - backHalfWidth,
            bottomBackY,
            rink.centerX - mouthHalfWidth,
            bottomGoalLineY,
            bottomInterior.x,
            bottomInterior.y
        ],
        [
            rink.centerX + mouthHalfWidth,
            bottomGoalLineY,
            rink.centerX + backHalfWidth,
            bottomBackY,
            bottomInterior.x,
            bottomInterior.y
        ],
        [
            rink.centerX + backHalfWidth,
            bottomBackY,
            rink.centerX - backHalfWidth,
            bottomBackY,
            bottomInterior.x,
            bottomInterior.y
        ]
    ];

    for (const segment of segments) {
        resolveOneSidedNetSegment(
            state,
            puck,
            segment[0],
            segment[1],
            segment[2],
            segment[3],
            segment[4],
            segment[5]
        );
    }
}

function resolvePuckPostCollision(
    state,
    puck,
    postX,
    postY
) {
    const combinedRadius =
        state.puckRadius + 3.5;

    const deltaX =
        puck.x - postX;

    const deltaY =
        puck.y - postY;

    const distanceSquared =
        deltaX * deltaX +
        deltaY * deltaY;

    if (
        distanceSquared >=
        combinedRadius *
        combinedRadius
    ) {
        return false;
    }

    let distance =
        Math.sqrt(distanceSquared);

    let normalX;
    let normalY;

    if (distance > 0.001) {
        normalX =
            deltaX / distance;

        normalY =
            deltaY / distance;
    } else {
        const velocityLength =
            Math.sqrt(
                state.puckVelocityX *
                    state.puckVelocityX +
                state.puckVelocityY *
                    state.puckVelocityY
            );

        if (velocityLength > 0.001) {
            normalX =
                -state.puckVelocityX /
                velocityLength;

            normalY =
                -state.puckVelocityY /
                velocityLength;
        } else {
            normalX = 1;
            normalY = 0;
        }

        distance = 0;
    }

    const overlap =
        combinedRadius - distance;

    puck.x += normalX * overlap;
    puck.y += normalY * overlap;

    const velocityAlongNormal =
        state.puckVelocityX *
        normalX +
        state.puckVelocityY *
        normalY;

    if (velocityAlongNormal < 0) {
        const restitution = 0.72;

        state.puckVelocityX -=
            (1 + restitution) *
            velocityAlongNormal *
            normalX;

        state.puckVelocityY -=
            (1 + restitution) *
            velocityAlongNormal *
            normalY;

        state.puckVelocityX *= 0.93;
        state.puckVelocityY *= 0.93;
    }

    /*
     * Tiny outward separation prevents the puck
     * from re-colliding with the post immediately.
     */

    puck.x += normalX * 0.6;
    puck.y += normalY * 0.6;

    return true;
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

    const lengthSquared =
        segmentX * segmentX +
        segmentY * segmentY;

    if (lengthSquared <= 0) {
        return;
    }

    let projection =
        (
            (puck.x - x1) *
            segmentX +
            (puck.y - y1) *
            segmentY
        ) /
        lengthSquared;

    /*
     * Leave a small gap near each endpoint.
     * The circular post collision handles these
     * regions more naturally than the wall does.
     */

    const endpointBuffer = 0.13;

    if (
        projection <
            endpointBuffer ||
        projection >
            1 - endpointBuffer
    ) {
        return;
    }

    projection =
        Phaser.Math.Clamp(
            projection,
            endpointBuffer,
            1 - endpointBuffer
        );

    const closestX =
        x1 +
        segmentX * projection;

    const closestY =
        y1 +
        segmentY * projection;

    const segmentLength =
        Math.sqrt(lengthSquared);

    let normalX =
        -segmentY /
        segmentLength;

    let normalY =
        segmentX /
        segmentLength;

    const interiorDot =
        normalX *
        (interiorX - closestX) +
        normalY *
        (interiorY - closestY);

    if (interiorDot < 0) {
        normalX *= -1;
        normalY *= -1;
    }

    const signedDistance =
        (
            puck.x - closestX
        ) *
        normalX +
        (
            puck.y - closestY
        ) *
        normalY;

    const collisionRadius =
        state.puckRadius + 1.2;

    if (
        signedDistance >=
        collisionRadius
    ) {
        return;
    }

    const correction =
        collisionRadius -
        signedDistance;

    puck.x +=
        normalX * correction;

    puck.y +=
        normalY * correction;

    const velocityAlongNormal =
        state.puckVelocityX *
        normalX +
        state.puckVelocityY *
        normalY;

    if (velocityAlongNormal < 0) {
        const restitution = 0.35;

        state.puckVelocityX -=
            (1 + restitution) *
            velocityAlongNormal *
            normalX;

        state.puckVelocityY -=
            (1 + restitution) *
            velocityAlongNormal *
            normalY;

        state.puckVelocityX *= 0.84;
        state.puckVelocityY *= 0.84;
    }
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
    const padding = 4;

    const insetLeft =
        rink.left +
        objectRadius +
        padding;

    const insetRight =
        rink.right -
        objectRadius -
        padding;

    const insetTop =
        rink.top +
        objectRadius +
        padding;

    const insetBottom =
        rink.bottom -
        objectRadius -
        padding;

    const innerCornerRadius =
        Math.max(
            rink.cornerRadius -
            objectRadius -
            padding,
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

    let hitX =
        correctedX !== x;

    let hitY =
        correctedY !== y;

    const isLeft =
        correctedX <
        rink.left +
        rink.cornerRadius;

    const isRight =
        correctedX >
        rink.right -
        rink.cornerRadius;

    const isTop =
        correctedY <
        rink.top +
        rink.cornerRadius;

    const isBottom =
        correctedY >
        rink.bottom -
        rink.cornerRadius;

    let cornerX = null;
    let cornerY = null;

    if (isLeft && isTop) {
        cornerX =
            rink.left +
            rink.cornerRadius;

        cornerY =
            rink.top +
            rink.cornerRadius;
    } else if (
        isRight &&
        isTop
    ) {
        cornerX =
            rink.right -
            rink.cornerRadius;

        cornerY =
            rink.top +
            rink.cornerRadius;
    } else if (
        isLeft &&
        isBottom
    ) {
        cornerX =
            rink.left +
            rink.cornerRadius;

        cornerY =
            rink.bottom -
            rink.cornerRadius;
    } else if (
        isRight &&
        isBottom
    ) {
        cornerX =
            rink.right -
            rink.cornerRadius;

        cornerY =
            rink.bottom -
            rink.cornerRadius;
    }

    if (
        cornerX !== null &&
        cornerY !== null
    ) {
        const deltaX =
            correctedX - cornerX;

        const deltaY =
            correctedY - cornerY;

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
                cornerX +
                normalX *
                innerCornerRadius;

            const newY =
                cornerY +
                normalY *
                innerCornerRadius;

            hitX =
                hitX ||
                Math.abs(
                    newX - correctedX
                ) > 0.01;

            hitY =
                hitY ||
                Math.abs(
                    newY - correctedY
                ) > 0.01;

            correctedX = newX;
            correctedY = newY;
        }
    }

    return {
        x: correctedX,
        y: correctedY,
        hitX,
        hitY
    };
}