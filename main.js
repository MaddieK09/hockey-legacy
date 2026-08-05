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

        normalMaximumSpeed: 145,
        sprintMaximumSpeed: 225,

        playerAcceleration: 620,
        sprintAcceleration: 500,
        playerDeceleration: 760,

        puckFriction: 0.985,

        facingAngle: -Math.PI / 2,
        targetFacingAngle: -Math.PI / 2,
        facingX: 0,
        facingY: -1,
        turnSpeed: 7.5,

        sprinting: false,
        sprintButton: null,

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
            maximumDistance: 52,

            base: null,
            knob: null,
            label: null,
            guide: null,
            powerBar: null
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
        "Version 0.0.55",
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
        .setInteractive({
            useHandCursor: true
        });

    playButton.on("pointerdown", () => {
        if (scene.gameState.gameStarted) {
            return;
        }

        playButton.disableInteractive();

        titleText.setVisible(false);
        versionText.setVisible(false);
        playButton.setVisible(false);

        scene.cameras.main.setBackgroundColor(
            "#d8f0ff"
        );

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

    scene.input.on(
        "pointerupoutside",
        pointer => {
            finishMovementPointer(
                scene,
                pointer
            );

            finishAimPointer(
                scene,
                pointer,
                true
            );

            releaseSprintPointer(
                scene,
                pointer
            );
        }
    );

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

    updatePlayerVelocity(
        this,
        deltaSeconds
    );

    updatePlayerFacing(
        this,
        deltaSeconds
    );

    updatePlayerMovement(
        this,
        deltaSeconds
    );

    /*
     * Stickhandling happens before puck physics.
     * This prevents puck control from moving the
     * puck through a post after collision checks.
     */
    updatePuckControl(
        this,
        deltaSeconds
    );

    updatePuckMovement(
        this,
        deltaSeconds
    );

    updatePlayerStick(this);
    updateAimGuide(this);
}

/* =========================================================
   RINK
========================================================= */

function drawRink(scene, rink) {
    const graphics =
        scene.add.graphics();

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
    graphics.fillStyle(
        0xf4fbff,
        1
    );

    graphics.fillRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
    );
}

function drawBoardOutline(graphics, rink) {
    graphics.lineStyle(
        4,
        0x1d5fa7,
        1
    );

    graphics.strokeRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
    );
}

function drawMainLines(graphics, rink) {
    const left = rink.left + 4;
    const right = rink.right - 4;

    graphics.lineStyle(
        4,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        left,
        rink.centerY,
        right,
        rink.centerY
    );

    graphics.lineStyle(
        4,
        0x1d5fa7,
        1
    );

    graphics.lineBetween(
        left,
        rink.centerY - 150,
        right,
        rink.centerY - 150
    );

    graphics.lineBetween(
        left,
        rink.centerY + 150,
        right,
        rink.centerY + 150
    );
}

function drawCenterIce(graphics, rink) {
    graphics.lineStyle(
        3,
        0x4fc3ff,
        1
    );

    graphics.strokeCircle(
        rink.centerX,
        rink.centerY,
        42
    );

    graphics.fillStyle(
        0x4fc3ff,
        1
    );

    graphics.fillCircle(
        rink.centerX,
        rink.centerY,
        4
    );
}

function drawFaceoffLayout(graphics, rink) {
    const circles = [
        [
            rink.centerX - 85,
            rink.centerY - 215
        ],
        [
            rink.centerX + 85,
            rink.centerY - 215
        ],
        [
            rink.centerX - 85,
            rink.centerY + 215
        ],
        [
            rink.centerX + 85,
            rink.centerY + 215
        ]
    ];

    graphics.lineStyle(
        2,
        0xff3b30,
        1
    );

    for (const [x, y] of circles) {
        drawFaceoffCircle(
            graphics,
            x,
            y,
            34
        );
    }

    graphics.fillStyle(
        0xff3b30,
        1
    );

    for (const [x, y] of circles) {
        graphics.fillCircle(
            x,
            y,
            3
        );
    }

    const neutralDots = [
        [
            rink.centerX - 95,
            rink.centerY - 75
        ],
        [
            rink.centerX + 95,
            rink.centerY - 75
        ],
        [
            rink.centerX - 95,
            rink.centerY + 75
        ],
        [
            rink.centerX + 95,
            rink.centerY + 75
        ]
    ];

    for (
        const [x, y]
        of neutralDots
    ) {
        graphics.fillCircle(
            x,
            y,
            3
        );
    }
}

function drawFaceoffCircle(
    graphics,
    x,
    y,
    radius
) {
    graphics.strokeCircle(
        x,
        y,
        radius
    );

    const outer = 5;
    const inner = 2;
    const gap = 5;

    const hashLines = [
        [
            x - gap,
            y - radius - outer,
            x - gap,
            y - radius + inner
        ],
        [
            x + gap,
            y - radius - outer,
            x + gap,
            y - radius + inner
        ],
        [
            x - gap,
            y + radius - inner,
            x - gap,
            y + radius + outer
        ],
        [
            x + gap,
            y + radius - inner,
            x + gap,
            y + radius + outer
        ],
        [
            x - radius - outer,
            y - gap,
            x - radius + inner,
            y - gap
        ],
        [
            x - radius - outer,
            y + gap,
            x - radius + inner,
            y + gap
        ],
        [
            x + radius - inner,
            y - gap,
            x + radius + outer,
            y - gap
        ],
        [
            x + radius - inner,
            y + gap,
            x + radius + outer,
            y + gap
        ]
    ];

    for (const line of hashLines) {
        graphics.lineBetween(
            ...line
        );
    }

    const horizontalOffset = 11;
    const verticalOffset = 8;
    const length = 6;

    const corners = [
        [
            x - horizontalOffset,
            y - verticalOffset,
            1,
            1
        ],
        [
            x + horizontalOffset,
            y - verticalOffset,
            -1,
            1
        ],
        [
            x - horizontalOffset,
            y + verticalOffset,
            1,
            -1
        ],
        [
            x + horizontalOffset,
            y + verticalOffset,
            -1,
            -1
        ]
    ];

    for (
        const [
            cornerX,
            cornerY,
            horizontalDirection,
            verticalDirection
        ]
        of corners
    ) {
        graphics.lineBetween(
            cornerX,
            cornerY,
            cornerX +
                length *
                horizontalDirection,
            cornerY
        );

        graphics.lineBetween(
            cornerX,
            cornerY,
            cornerX,
            cornerY +
                length *
                verticalDirection
        );
    }
}

function drawGoalsAndCreases(
    graphics,
    rink
) {
    const topGoalLineY =
        rink.top + 44;

    const bottomGoalLineY =
        rink.bottom - 44;

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

    graphics.lineStyle(
        3,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        rink.left + 4,
        topGoalLineY,
        rink.right - 4,
        topGoalLineY
    );

    graphics.lineBetween(
        rink.left + 4,
        bottomGoalLineY,
        rink.right - 4,
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

function drawGoalCrease(
    graphics,
    centerX,
    goalLineY,
    side
) {
    const halfWidth = 34;
    const depth = 32;

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
            centerX - halfWidth,
            goalLineY
        );

        graphics.lineTo(
            centerX + halfWidth,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            depth,
            0,
            Math.PI,
            false
        );
    } else {
        graphics.moveTo(
            centerX + halfWidth,
            goalLineY
        );

        graphics.lineTo(
            centerX - halfWidth,
            goalLineY
        );

        graphics.arc(
            centerX,
            goalLineY,
            depth,
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
        goalLineY +
            6 * direction
    );

    graphics.lineBetween(
        centerX + 18,
        goalLineY,
        centerX + 18,
        goalLineY +
            6 * direction
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
    const depth = 28;

    const backY =
        goalLineY +
        depth * direction;

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
        goalLineY +
            depth *
            0.33 *
            direction,
        centerX + 18,
        goalLineY +
            depth *
            0.33 *
            direction
    );

    graphics.lineBetween(
        centerX - 16,
        goalLineY +
            depth *
            0.66 *
            direction,
        centerX + 16,
        goalLineY +
            depth *
            0.66 *
            direction
    );

    for (
        const offset
        of [-12, -6, 0, 6, 12]
    ) {
        graphics.lineBetween(
            centerX + offset,
            goalLineY,
            centerX +
                offset * 0.75,
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
    const topGoalLineY =
        rink.top + 44;

    const bottomGoalLineY =
        rink.bottom - 44;

    graphics.lineStyle(
        2,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        rink.centerX - 30,
        topGoalLineY,
        rink.centerX - 48,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX + 30,
        topGoalLineY,
        rink.centerX + 48,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX - 30,
        bottomGoalLineY,
        rink.centerX - 48,
        rink.bottom - 5
    );

    graphics.lineBetween(
        rink.centerX + 30,
        bottomGoalLineY,
        rink.centerX + 48,
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
    )
        .setStrokeStyle(
            3,
            0xffffff,
            1
        )
        .setDepth(20);

    state.playerStick =
        scene.add.graphics()
            .setDepth(21);
}

function createPuck(scene) {
    const state = scene.gameState;
    const rink = state.rink;

    state.puck = scene.add.circle(
        rink.centerX,
        rink.centerY + 50,
        state.puckRadius,
        0x111111
    )
        .setStrokeStyle(
            1,
            0x555555,
            1
        )
        .setDepth(22);
}

/* =========================================================
   MOBILE CONTROLS
========================================================= */

function createMobileControls(scene) {
    const rink =
        scene.gameState.rink;

    const controlsY = Math.min(
        rink.bottom - 88,
        scene.scale.height - 145
    );

    const movementX =
        rink.left + 64;

    const aimX =
        rink.right - 64;

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
        rink.centerX,
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
    )
        .setStrokeStyle(
            2,
            0xffffff,
            0.85
        )
        .setDepth(100);

    movement.knob = scene.add.circle(
        x,
        y,
        movement.knobRadius,
        0x2f71b7,
        0.95
    )
        .setStrokeStyle(
            2,
            0xffffff,
            0.95
        )
        .setDepth(101);

    const hitArea = scene.add.circle(
        x,
        y,
        movement.baseRadius + 14,
        0xffffff,
        0.001
    )
        .setDepth(102)
        .setInteractive({
            useHandCursor: true
        });

    hitArea.on(
        "pointerdown",
        pointer => {
            if (movement.active) {
                return;
            }

            movement.active = true;
            movement.pointerId =
                pointer.id;

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
    const aim =
        scene.gameState.aim;

    aim.centerX = x;
    aim.centerY = y;

    aim.base = scene.add.circle(
        x,
        y,
        aim.baseRadius,
        0x8f2020,
        0.74
    )
        .setStrokeStyle(
            2,
            0xffffff,
            0.85
        )
        .setDepth(100);

    aim.knob = scene.add.circle(
        x,
        y,
        aim.knobRadius,
        0xe04444,
        0.98
    )
        .setStrokeStyle(
            2,
            0xffffff,
            0.95
        )
        .setDepth(101);

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

    aim.guide =
        scene.add.graphics()
            .setDepth(19);

    aim.powerBar =
        scene.add.graphics()
            .setDepth(104);

    const hitArea = scene.add.circle(
        x,
        y,
        aim.baseRadius + 16,
        0xffffff,
        0.001
    )
        .setDepth(103)
        .setInteractive({
            useHandCursor: true
        });

    hitArea.on(
        "pointerdown",
        pointer => {
            if (aim.active) {
                return;
            }

            aim.active = true;
            aim.pointerId =
                pointer.id;

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
    const state =
        scene.gameState;

    const button =
        scene.add.rectangle(
            x,
            y,
            96,
            38,
            0x1769d2,
            0.92
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
            )
            .setDepth(110)
            .setInteractive({
                useHandCursor: true
            });

    const label = scene.add.text(
        x,
        y,
        "⚡ SPRINT",
        {
            font: "bold 12px Arial",
            fill: "#ffffff"
        }
    )
        .setOrigin(0.5)
        .setDepth(111)
        .setInteractive({
            useHandCursor: true
        });

    state.sprintButton = {
        button,
        label,
        pointerId: null
    };

    button.on(
        "pointerdown",
        pointer => {
            startSprint(
                scene,
                pointer
            );
        }
    );

    label.on(
        "pointerdown",
        pointer => {
            startSprint(
                scene,
                pointer
            );
        }
    );
}

function startSprint(
    scene,
    pointer
) {
    const state =
        scene.gameState;

    if (
        !state.sprintButton ||
        state.sprintButton.pointerId !==
            null
    ) {
        return;
    }

    state.sprintButton.pointerId =
        pointer.id;

    state.sprinting = true;

    state.sprintButton.button
        .setFillStyle(
            0x4ba3ff,
            1
        )
        .setScale(1.05);

    state.sprintButton.label
        .setScale(1.05);
}

function releaseSprintPointer(
    scene,
    pointer
) {
    const state =
        scene.gameState;

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
    const state =
        scene.gameState;

    state.sprinting = false;

    if (!state.sprintButton) {
        return;
    }

    state.sprintButton.pointerId =
        null;

    state.sprintButton.button
        .setFillStyle(
            0x1769d2,
            0.92
        )
        .setScale(1);

    state.sprintButton.label
        .setScale(1);
}

/* =========================================================
   MOVEMENT JOYSTICK
========================================================= */

function updateMovementPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    if (
        !movement.active ||
        movement.pointerId !==
            pointer.id
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

    if (distance < 4) {
        movement.directionX = 0;
        movement.directionY = 0;
        movement.strength = 0;

        movement.knob.setPosition(
            movement.centerX,
            movement.centerY
        );

        return;
    }

    const directionX =
        deltaX / distance;

    const directionY =
        deltaY / distance;

    const clampedDistance =
        Math.min(
            distance,
            movement.maximumDistance
        );

    movement.directionX =
        directionX;

    movement.directionY =
        directionY;

    movement.strength =
        Phaser.Math.Clamp(
            clampedDistance /
                movement.maximumDistance,
            0,
            1
        );

    movement.knob.setPosition(
        movement.centerX +
            directionX *
            clampedDistance,

        movement.centerY +
            directionY *
            clampedDistance
    );
}

function finishMovementPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    if (
        !movement.active ||
        movement.pointerId !==
            pointer.id
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

    if (movement.knob) {
        movement.knob.setPosition(
            movement.centerX,
            movement.centerY
        );
    }

    if (movement.base) {
        movement.base.setFillStyle(
            0x17375e,
            0.72
        );
    }
}

/* =========================================================
   AIM JOYSTICK
========================================================= */

function updateAimPointer(
    scene,
    pointer
) {
    const aim =
        scene.gameState.aim;

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
    const state =
        scene.gameState;

    const aim = state.aim;

    const deltaX =
        pointer.x - aim.centerX;

    const deltaY =
        pointer.y - aim.centerY;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    if (distance < 4) {
        aim.directionX =
            state.facingX;

        aim.directionY =
            state.facingY;

        aim.distance = 0;
        aim.strength = 0;

        aim.knob.setPosition(
            aim.centerX,
            aim.centerY
        );

        aim.label.setPosition(
            aim.centerX,
            aim.centerY
        );

        return;
    }

    const directionX =
        deltaX / distance;

    const directionY =
        deltaY / distance;

    const clampedDistance =
        Math.min(
            distance,
            aim.maximumDistance
        );

    aim.directionX =
        directionX;

    aim.directionY =
        directionY;

    aim.distance =
        clampedDistance;

    /*
     * Drag distance directly controls
     * shot power.
     */
    aim.strength =
        Phaser.Math.Clamp(
            clampedDistance /
                aim.maximumDistance,
            0,
            1
        );

    const knobX =
        aim.centerX +
        directionX *
        clampedDistance;

    const knobY =
        aim.centerY +
        directionY *
        clampedDistance;

    aim.knob.setPosition(
        knobX,
        knobY
    );

    aim.label.setPosition(
        knobX,
        knobY
    );

    /*
     * Drag direction directly controls
     * where the player aims.
     */
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
    const aim =
        scene.gameState.aim;

    if (
        !aim.active ||
        aim.pointerId !== pointer.id
    ) {
        return;
    }

    if (
        shouldShoot &&
        aim.strength > 0.08
    ) {
        shootPuckWithAim(scene);
    }

    resetAimJoystick(scene);
}

function resetAimJoystick(scene) {
    const aim =
        scene.gameState.aim;

    aim.active = false;
    aim.pointerId = null;
    aim.distance = 0;
    aim.strength = 0;

    if (aim.knob) {
        aim.knob.setPosition(
            aim.centerX,
            aim.centerY
        );
    }

    if (aim.label) {
        aim.label.setPosition(
            aim.centerX,
            aim.centerY
        );
    }

    if (aim.base) {
        aim.base.setFillStyle(
            0x8f2020,
            0.74
        );
    }

    if (aim.guide) {
        aim.guide.clear();
    }

    if (aim.powerBar) {
        aim.powerBar.clear();
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
    const state =
        scene.gameState;

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
    const state =
        scene.gameState;

    const keyboard =
        state.keyboard;

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
    } else if (
        !state.movement.active
    ) {
        state.movement.directionX = 0;
        state.movement.directionY = 0;
        state.movement.strength = 0;
    }

    if (
        !state.sprintButton ||
        state.sprintButton.pointerId ===
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
            360
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
    const state =
        scene.gameState;

    const movement =
        state.movement;

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
            changeRate *
                deltaSeconds
        );

    state.playerVelocityY =
        moveToward(
            state.playerVelocityY,
            targetVelocityY,
            changeRate *
                deltaSeconds
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
        Math.abs(
            target - current
        ) <= maximumChange
    ) {
        return target;
    }

    return (
        current +
        Math.sign(
            target - current
        ) *
        maximumChange
    );
}

function updatePlayerFacing(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const difference =
        Phaser.Math.Angle.Wrap(
            state.targetFacingAngle -
            state.facingAngle
        );

    const sprintTurnMultiplier =
        state.sprinting
            ? 0.8
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
        Math.cos(
            state.facingAngle
        );

    state.facingY =
        Math.sin(
            state.facingAngle
        );
}

function updatePlayerMovement(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const player =
        state.player;

    const corrected =
        clampPointInsideRoundedRink(
            player.x +
                state.playerVelocityX *
                deltaSeconds,

            player.y +
                state.playerVelocityY *
                deltaSeconds,

            state.playerRadius,
            state.rink
        );

    player.setPosition(
        corrected.x,
        corrected.y
    );

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
    const perpendicularX =
        -state.facingY;

    const perpendicularY =
        state.facingX;

    return {
        x:
            state.player.x +
            state.facingX * 25 +
            perpendicularX * 8,

        y:
            state.player.y +
            state.facingY * 25 +
            perpendicularY * 8,

        perpendicularX,
        perpendicularY
    };
}

function updatePlayerStick(scene) {
    const state =
        scene.gameState;

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
    const state =
        scene.gameState;

    const puck =
        state.puck;

    const blade =
        getStickBladePosition(state);

    const deltaX =
        blade.x - puck.x;

    const deltaY =
        blade.y - puck.y;

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

    /*
     * No magnetic puck control beside the
     * posts or net walls.
     */
    const nearGoalFrame =
        isPointNearEitherGoalFrame(
            state,
            puck.x,
            puck.y,
            18
        ) ||
        isPointNearEitherGoalFrame(
            state,
            blade.x,
            blade.y,
            12
        );

    const controlDistance = 13;

    if (
        distance <= controlDistance &&
        puckSpeed < 185 &&
        !nearGoalFrame
    ) {
        /*
         * Velocity-only stickhandling.
         *
         * The puck position is never directly
         * moved toward the blade, which stops
         * it from snapping through the net.
         */
        const spring = 12;
        const damping = 0.72;

        state.puckVelocityX +=
            deltaX *
            spring *
            deltaSeconds;

        state.puckVelocityY +=
            deltaY *
            spring *
            deltaSeconds;

        state.puckVelocityX =
            Phaser.Math.Linear(
                state.puckVelocityX,
                state.playerVelocityX,
                deltaSeconds *
                    damping
            );

        state.puckVelocityY =
            Phaser.Math.Linear(
                state.puckVelocityY,
                state.playerVelocityY,
                deltaSeconds *
                    damping
            );
    } else {
        handlePlayerPuckCollision(
            scene
        );
    }
}

function handlePlayerPuckCollision(scene) {
    const state =
        scene.gameState;

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
        normalX * 18 +
        state.playerVelocityX *
            0.12;

    state.puckVelocityY +=
        normalY * 18 +
        state.playerVelocityY *
            0.12;
}

/* =========================================================
   AIMING AND SHOOTING
========================================================= */

function updateAimGuide(scene) {
    const state =
        scene.gameState;

    const aim =
        state.aim;

    if (
        !aim.guide ||
        !aim.powerBar
    ) {
        return;
    }

    aim.guide.clear();
    aim.powerBar.clear();

    if (!aim.active) {
        return;
    }

    const blade =
        getStickBladePosition(state);

    const guideLength =
        42 +
        aim.strength * 100;

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

    const guideColor =
        canShoot
            ? 0xffd21f
            : 0xff3b30;

    /*
     * Arrow direction shows aim.
     * Arrow length/thickness shows power.
     */
    aim.guide.lineStyle(
        2 +
            aim.strength * 3,
        guideColor,
        0.88
    );

    aim.guide.lineBetween(
        blade.x,
        blade.y,
        endX,
        endY
    );

    aim.guide.fillStyle(
        guideColor,
        0.95
    );

    aim.guide.fillTriangle(
        endX,
        endY,

        endX -
            aim.directionX * 11 -
            aim.directionY * 6,

        endY -
            aim.directionY * 11 +
            aim.directionX * 6,

        endX -
            aim.directionX * 11 +
            aim.directionY * 6,

        endY -
            aim.directionY * 11 -
            aim.directionX * 6
    );

    /*
     * Visible power bar above the shot stick.
     */
    const barWidth = 76;
    const barHeight = 8;

    const barX =
        aim.centerX -
        barWidth / 2;

    const barY =
        aim.centerY - 58;

    aim.powerBar.fillStyle(
        0x111111,
        0.7
    );

    aim.powerBar.fillRoundedRect(
        barX,
        barY,
        barWidth,
        barHeight,
        4
    );

    aim.powerBar.fillStyle(
        guideColor,
        0.95
    );

    aim.powerBar.fillRoundedRect(
        barX,
        barY,
        barWidth *
            aim.strength,
        barHeight,
        4
    );
}

function isPuckShootable(state) {
    const blade =
        getStickBladePosition(state);

    const deltaX =
        state.puck.x -
        blade.x;

    const deltaY =
        state.puck.y -
        blade.y;

    const distance = Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
    );

    /*
     * Much shorter shooting reach.
     */
    return distance <= 14;
}

function shootPuckWithAim(scene) {
    const state =
        scene.gameState;

    const aim =
        state.aim;

    /*
     * Short drag = soft shot.
     * Full drag = hard shot.
     */
    const shotSpeed =
        95 +
        aim.strength * 390;

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
    const state =
        scene.gameState;

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
     * Shooting only changes velocity.
     * The puck is never teleported.
     */
    state.puckVelocityX =
        directionX *
        shotSpeed +
        state.playerVelocityX *
            0.08;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        state.playerVelocityY *
            0.08;
}

/* =========================================================
   PUCK PHYSICS
========================================================= */

function updatePuckMovement(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const puck =
        state.puck;

    const travelDistance = Math.sqrt(
        (
            state.puckVelocityX *
            deltaSeconds
        ) ** 2 +
        (
            state.puckVelocityY *
            deltaSeconds
        ) ** 2
    );

    /*
     * Small physics steps prevent fast shots
     * from skipping through a post or net.
     */
    const steps = Math.max(
        1,
        Math.ceil(
            travelDistance / 0.75
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

        handleGoalNetCollisions(
            scene
        );

        const corrected =
            clampPointInsideRoundedRink(
                puck.x,
                puck.y,
                state.puckRadius,
                state.rink
            );

        if (corrected.hitX) {
            state.puckVelocityX *=
                -0.55;
        }

        if (corrected.hitY) {
            state.puckVelocityY *=
                -0.55;
        }

        puck.setPosition(
            corrected.x,
            corrected.y
        );
    }

    const friction = Math.pow(
        state.puckFriction,
        deltaSeconds * 60
    );

    state.puckVelocityX *=
        friction;

    state.puckVelocityY *=
        friction;

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
   GOAL PHYSICS
========================================================= */

function getGoalGeometry(state) {
    const rink =
        state.rink;

    const mouthHalfWidth = 20;
    const backHalfWidth = 14;
    const depth = 28;

    const topLineY =
        rink.top + 44;

    const bottomLineY =
        rink.bottom - 44;

    return {
        posts: [
            [
                rink.centerX -
                    mouthHalfWidth,
                topLineY
            ],
            [
                rink.centerX +
                    mouthHalfWidth,
                topLineY
            ],
            [
                rink.centerX -
                    mouthHalfWidth,
                bottomLineY
            ],
            [
                rink.centerX +
                    mouthHalfWidth,
                bottomLineY
            ]
        ],

        segments: [
            [
                rink.centerX -
                    mouthHalfWidth,
                topLineY,
                rink.centerX -
                    backHalfWidth,
                topLineY - depth
            ],
            [
                rink.centerX -
                    backHalfWidth,
                topLineY - depth,
                rink.centerX +
                    backHalfWidth,
                topLineY - depth
            ],
            [
                rink.centerX +
                    backHalfWidth,
                topLineY - depth,
                rink.centerX +
                    mouthHalfWidth,
                topLineY
            ],
            [
                rink.centerX -
                    mouthHalfWidth,
                bottomLineY,
                rink.centerX -
                    backHalfWidth,
                bottomLineY + depth
            ],
            [
                rink.centerX -
                    backHalfWidth,
                bottomLineY + depth,
                rink.centerX +
                    backHalfWidth,
                bottomLineY + depth
            ],
            [
                rink.centerX +
                    backHalfWidth,
                bottomLineY + depth,
                rink.centerX +
                    mouthHalfWidth,
                bottomLineY
            ]
        ]
    };
}

function isPointNearEitherGoalFrame(
    state,
    x,
    y,
    distanceLimit
) {
    const geometry =
        getGoalGeometry(state);

    for (
        const [postX, postY]
        of geometry.posts
    ) {
        if (
            Phaser.Math.Distance.Between(
                x,
                y,
                postX,
                postY
            ) <= distanceLimit
        ) {
            return true;
        }
    }

    for (
        const [
            x1,
            y1,
            x2,
            y2
        ]
        of geometry.segments
    ) {
        const closest =
            closestPointOnSegment(
                x,
                y,
                x1,
                y1,
                x2,
                y2
            );

        if (
            Phaser.Math.Distance.Between(
                x,
                y,
                closest.x,
                closest.y
            ) <= distanceLimit
        ) {
            return true;
        }
    }

    return false;
}

function handleGoalNetCollisions(scene) {
    const state =
        scene.gameState;

    const puck =
        state.puck;

    const geometry =
        getGoalGeometry(state);

    /*
     * Posts are circular collision objects.
     */
    for (
        const [postX, postY]
        of geometry.posts
    ) {
        resolvePuckCircleCollision(
            state,
            puck,
            postX,
            postY,
            state.puckRadius + 3.5,
            0.72
        );
    }

    /*
     * Net walls use two-sided collision.
     *
     * The collision normal always points from
     * the frame toward the puck, so the wall
     * cannot drag the puck into the goal.
     */
    for (
        const [
            x1,
            y1,
            x2,
            y2
        ]
        of geometry.segments
    ) {
        resolvePuckSegmentCollision(
            state,
            puck,
            x1,
            y1,
            x2,
            y2
        );
    }
}

function closestPointOnSegment(
    pointX,
    pointY,
    x1,
    y1,
    x2,
    y2
) {
    const segmentX =
        x2 - x1;

    const segmentY =
        y2 - y1;

    const lengthSquared =
        segmentX * segmentX +
        segmentY * segmentY;

    if (lengthSquared <= 0) {
        return {
            x: x1,
            y: y1,
            t: 0
        };
    }

    const t =
        Phaser.Math.Clamp(
            (
                (
                    pointX - x1
                ) * segmentX +
                (
                    pointY - y1
                ) * segmentY
            ) /
            lengthSquared,
            0,
            1
        );

    return {
        x:
            x1 +
            segmentX * t,

        y:
            y1 +
            segmentY * t,

        t
    };
}

function resolvePuckSegmentCollision(
    state,
    puck,
    x1,
    y1,
    x2,
    y2
) {
    const closest =
        closestPointOnSegment(
            puck.x,
            puck.y,
            x1,
            y1,
            x2,
            y2
        );

    /*
     * Circular post collisions control the
     * immediate ends of the net walls.
     */
    if (
        closest.t < 0.12 ||
        closest.t > 0.88
    ) {
        return false;
    }

    const deltaX =
        puck.x - closest.x;

    const deltaY =
        puck.y - closest.y;

    const distanceSquared =
        deltaX * deltaX +
        deltaY * deltaY;

    const collisionRadius =
        state.puckRadius + 1.25;

    if (
        distanceSquared >=
        collisionRadius *
            collisionRadius
    ) {
        return false;
    }

    let distance =
        Math.sqrt(
            distanceSquared
        );

    let normalX;
    let normalY;

    if (distance > 0.001) {
        normalX =
            deltaX / distance;

        normalY =
            deltaY / distance;
    } else {
        const segmentX =
            x2 - x1;

        const segmentY =
            y2 - y1;

        const segmentLength =
            Math.sqrt(
                segmentX * segmentX +
                segmentY * segmentY
            ) || 1;

        normalX =
            -segmentY /
            segmentLength;

        normalY =
            segmentX /
            segmentLength;

        /*
         * Point the normal against the
         * incoming puck velocity.
         */
        if (
            state.puckVelocityX *
                normalX +
            state.puckVelocityY *
                normalY >
            0
        ) {
            normalX *= -1;
            normalY *= -1;
        }

        distance = 0;
    }

    const overlap =
        collisionRadius -
        distance;

    puck.x +=
        normalX * overlap;

    puck.y +=
        normalY * overlap;

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (velocityAlongNormal < 0) {
        const restitution = 0.34;

        state.puckVelocityX -=
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalX;

        state.puckVelocityY -=
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalY;

        state.puckVelocityX *=
            0.88;

        state.puckVelocityY *=
            0.88;
    }

    return true;
}

function resolvePuckCircleCollision(
    state,
    puck,
    centerX,
    centerY,
    collisionRadius,
    restitution
) {
    const deltaX =
        puck.x - centerX;

    const deltaY =
        puck.y - centerY;

    const distanceSquared =
        deltaX * deltaX +
        deltaY * deltaY;

    if (
        distanceSquared >=
        collisionRadius *
            collisionRadius
    ) {
        return false;
    }

    let distance =
        Math.sqrt(
            distanceSquared
        );

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
            ) || 1;

        normalX =
            -state.puckVelocityX /
            velocityLength;

        normalY =
            -state.puckVelocityY /
            velocityLength;

        distance = 0;
    }

    const overlap =
        collisionRadius -
        distance;

    puck.x +=
        normalX *
        (
            overlap +
            0.25
        );

    puck.y +=
        normalY *
        (
            overlap +
            0.25
        );

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (velocityAlongNormal < 0) {
        state.puckVelocityX -=
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalX;

        state.puckVelocityY -=
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalY;

        state.puckVelocityX *=
            0.95;

        state.puckVelocityY *=
            0.95;
    }

    return true;
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
            correctedX -
            cornerX;

        const deltaY =
            correctedY -
            cornerY;

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
        hitX,
        hitY
    };
}