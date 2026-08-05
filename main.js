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

/* =========================================================
   CREATE
========================================================= */

function create() {
    const scene = this;

    const rink = {
        width: 330,
        height: 610,
        cornerRadius: 55
    };

    rink.centerX = scene.cameras.main.centerX;
    rink.centerY = scene.cameras.main.centerY;

    rink.left =
        rink.centerX -
        rink.width / 2;

    rink.right =
        rink.centerX +
        rink.width / 2;

    rink.top =
        rink.centerY -
        rink.height / 2;

    rink.bottom =
        rink.centerY +
        rink.height / 2;

    scene.gameState = {
        rink,
        gameStarted: false,

        player: null,
        playerStick: null,

        teammates: [],

        puck: null,

        playerRadius: 11,
        teammateRadius: 10,
        puckRadius: 5,

        playerVelocityX: 0,
        playerVelocityY: 0,

        puckVelocityX: 0,
        puckVelocityY: 0,

        normalMaximumSpeed: 145,
        sprintMaximumSpeed: 225,

        playerAcceleration: 620,
        sprintAcceleration: 510,
        playerDeceleration: 760,

        puckFriction: 0.985,

        facingAngle:
            -Math.PI / 2,

        targetFacingAngle:
            -Math.PI / 2,

        facingX: 0,
        facingY: -1,

        turnSpeed: 7.5,

        sprinting: false,
        sprintButton: null,

        keyboard: null,

        offensiveGoal: {
            x: rink.centerX,
            y: rink.top + 44
        },

        possession: {
            owner: null,

            pickupRadius: 22,
            pickupCooldown: 0,

            passTarget: null,
            passTargetType: null
        },

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
            maximumDistance: 55,

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
        "Version 0.0.59",
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

    playButton.on(
        "pointerdown",
        () => {
            const state =
                scene.gameState;

            if (state.gameStarted) {
                return;
            }

            playButton.disableInteractive();

            titleText.setVisible(false);
            versionText.setVisible(false);
            playButton.setVisible(false);

            scene.cameras.main
                .setBackgroundColor(
                    "#d8f0ff"
                );

            drawRink(scene, rink);

            createPlayer(scene);
            createTeammates(scene);
            createPuck(scene);

            createMobileControls(scene);
            createKeyboardControls(scene);

            state.gameStarted = true;

            updatePlayerStick(scene);
        }
    );

    scene.input.on(
        "pointermove",
        pointer => {
            updateMovementPointer(
                scene,
                pointer
            );

            updateAimPointer(
                scene,
                pointer
            );
        }
    );

    scene.input.on(
        "pointerup",
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
        }
    );

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
        }
    );

    scene.input.on(
        "gameout",
        () => {
            cancelJoysticks(scene);
        }
    );

    window.addEventListener(
        "blur",
        () => {
            cancelJoysticks(scene);
        }
    );
}

/* =========================================================
   UPDATE
========================================================= */

function update(time, delta) {
    const state =
        this.gameState;

    if (
        !state ||
        !state.gameStarted
    ) {
        return;
    }

    const deltaSeconds =
        Math.min(
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

    updatePlayerStick(this);

    updateTeammateAI(
        this,
        deltaSeconds
    );

    updatePossession(
        this,
        deltaSeconds
    );

    if (!state.possession.owner) {
        updatePuckMovement(
            this,
            deltaSeconds
        );

        checkForPuckPickup(this);
    }

    if (state.possession.owner) {
        hardLockPossessedPuck(this);
    }

    updateAimGuide(this);
    updateTeammateIndicators(this);
}

/* =========================================================
   RINK DRAWING
========================================================= */

function drawRink(scene, rink) {
    const graphics =
        scene.add.graphics();

    graphics.setDepth(1);

    drawIceSurface(
        graphics,
        rink
    );

    drawMainLines(
        graphics,
        rink
    );

    drawCenterIce(
        graphics,
        rink
    );

    drawFaceoffLayout(
        graphics,
        rink
    );

    drawGoalsAndCreases(
        graphics,
        rink
    );

    drawGoalieTrapezoids(
        graphics,
        rink
    );

    drawRefereeCrease(
        graphics,
        rink
    );

    drawBoardOutline(
        graphics,
        rink
    );
}

function drawIceSurface(
    graphics,
    rink
) {
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

function drawBoardOutline(
    graphics,
    rink
) {
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

function drawMainLines(
    graphics,
    rink
) {
    const left =
        rink.left + 4;

    const right =
        rink.right - 4;

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

function drawCenterIce(
    graphics,
    rink
) {
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

function drawFaceoffLayout(
    graphics,
    rink
) {
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

    for (
        const [x, y]
        of circles
    ) {
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

    for (
        const [x, y]
        of circles
    ) {
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

    const hashes = [
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

    for (
        const line
        of hashes
    ) {
        graphics.lineBetween(
            line[0],
            line[1],
            line[2],
            line[3]
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
        const corner
        of corners
    ) {
        const cornerX =
            corner[0];

        const cornerY =
            corner[1];

        const horizontalDirection =
            corner[2];

        const verticalDirection =
            corner[3];

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
   PLAYER
========================================================= */

function createPlayer(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

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

/* =========================================================
   TEAMMATES
========================================================= */

function createTeammates(scene) {
    const rink =
        scene.gameState.rink;

    createTeammate(
        scene,
        rink.centerX - 85,
        rink.centerY - 75,
        "LW",
        "left"
    );

    createTeammate(
        scene,
        rink.centerX + 85,
        rink.centerY - 120,
        "RW",
        "right"
    );
}

function createTeammate(
    scene,
    x,
    y,
    name,
    side
) {
    const state =
        scene.gameState;

    const body = scene.add.circle(
        x,
        y,
        state.teammateRadius,
        0x2b8f45
    )
        .setStrokeStyle(
            3,
            0xffffff,
            1
        )
        .setDepth(20);

    const stick =
        scene.add.graphics()
            .setDepth(21);

    const label = scene.add.text(
        x,
        y - 19,
        name,
        {
            font:
                "bold 10px Arial",

            fill:
                "#123d21",

            backgroundColor:
                "#ffffff"
        }
    )
        .setOrigin(0.5)
        .setDepth(24);

    const targetRing =
        scene.add.graphics()
            .setDepth(18);

    const teammate = {
        body,
        stick,
        label,
        targetRing,

        name,
        side,

        facingX: 0,
        facingY: -1,

        velocityX: 0,
        velocityY: 0,

        maximumSpeed:
            Phaser.Math.Between(
                112,
                128
            ),

        acceleration:
            Phaser.Math.Between(
                310,
                390
            ),

        deceleration: 430,
        turnSpeed: 5.5,

        targetX: x,
        targetY: y,

        decisionTimer:
            Phaser.Math.FloatBetween(
                0.6,
                1.1
            ),

        possessionTime: 0,

        laneOffsetX:
            side === "left"
                ? -78
                : 78,

        laneVariation:
            Phaser.Math.Between(
                -14,
                14
            ),

        cycleDirection:
            side === "left"
                ? 1
                : -1
    };

    state.teammates.push(
        teammate
    );

    updateTeammateStick(
        teammate
    );
}

/* =========================================================
   TEAMMATE AI
========================================================= */

function updateTeammateAI(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    for (
        const teammate
        of state.teammates
    ) {
        chooseTeammateTarget(
            scene,
            teammate
        );

        moveTeammateTowardTarget(
            scene,
            teammate,
            deltaSeconds
        );

        updateTeammateFacing(
            state,
            teammate,
            deltaSeconds
        );

        updateTeammateVisuals(
            teammate
        );
    }
}

function chooseTeammateTarget(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    const owner =
        state.possession.owner;

    const rink =
        state.rink;

    const goal =
        state.offensiveGoal;

    if (owner === teammate) {
        choosePuckCarrierTarget(
            state,
            teammate
        );

        return;
    }

    if (owner === state.player) {
        chooseSupportTargetForPlayer(
            state,
            teammate
        );

        return;
    }

    if (
        owner &&
        owner !== state.player
    ) {
        chooseSupportTargetForTeammate(
            state,
            teammate,
            owner
        );

        return;
    }

    const loosePuckChaser =
        findLoosePuckChaser(state);

    if (
        loosePuckChaser === teammate
    ) {
        teammate.targetX =
            state.puck.x;

        teammate.targetY =
            state.puck.y;

        return;
    }

    const puckY =
        Phaser.Math.Clamp(
            state.puck.y + 35,
            rink.top + 100,
            rink.bottom - 100
        );

    teammate.targetX =
        rink.centerX +
        teammate.laneOffsetX;

    teammate.targetY =
        puckY;

    if (
        state.puck.y <
        rink.centerY
    ) {
        teammate.targetY =
            Phaser.Math.Clamp(
                state.puck.y + 55,
                goal.y + 95,
                rink.centerY + 20
            );
    }
}

function chooseSupportTargetForPlayer(
    state,
    teammate
) {
    const rink =
        state.rink;

    const player =
        state.player;

    const playerAttacking =
        player.y <
        rink.centerY;

    if (!playerAttacking) {
        teammate.targetX =
            rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            player.y - 80;

        return;
    }

    const playerOnLeft =
        player.x <
        rink.centerX;

    const teammateIsFarSide =
        (
            playerOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !playerOnLeft &&
            teammate.side === "left"
        );

    if (teammateIsFarSide) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -48
                    : 48
            );

        teammate.targetY =
            state.offensiveGoal.y +
            80;

        return;
    }

    teammate.targetX =
        rink.centerX +
        teammate.laneOffsetX;

    teammate.targetY =
        Phaser.Math.Clamp(
            player.y + 55,
            state.offensiveGoal.y + 125,
            rink.centerY - 15
        );
}

function chooseSupportTargetForTeammate(
    state,
    teammate,
    puckCarrier
) {
    const rink =
        state.rink;

    if (teammate === puckCarrier) {
        return;
    }

    const carrierOnLeft =
        puckCarrier.body.x <
        rink.centerX;

    const teammateOnFarSide =
        (
            carrierOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !carrierOnLeft &&
            teammate.side === "left"
        );

    if (teammateOnFarSide) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -45
                    : 45
            );

        teammate.targetY =
            state.offensiveGoal.y +
            75;
    } else {
        teammate.targetX =
            rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            Phaser.Math.Clamp(
                puckCarrier.body.y + 60,
                state.offensiveGoal.y + 130,
                rink.centerY - 10
            );
    }
}

function choosePuckCarrierTarget(
    state,
    teammate
) {
    const rink =
        state.rink;

    const goal =
        state.offensiveGoal;

    const distanceToGoal =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            goal.x,
            goal.y
        );

    if (distanceToGoal > 190) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -50
                    : 50
            );

        teammate.targetY =
            goal.y + 145;

        return;
    }

    if (distanceToGoal > 105) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -32
                    : 32
            );

        teammate.targetY =
            goal.y + 90;

        return;
    }

    teammate.targetX =
        rink.centerX +
        (
            teammate.cycleDirection *
            18
        );

    teammate.targetY =
        goal.y + 64;
}

function findLoosePuckChaser(state) {
    let closestTeammate = null;
    let closestDistance = Infinity;

    for (
        const teammate
        of state.teammates
    ) {
        const distance =
            Phaser.Math.Distance.Between(
                teammate.body.x,
                teammate.body.y,
                state.puck.x,
                state.puck.y
            );

        if (
            distance <
            closestDistance
        ) {
            closestDistance =
                distance;

            closestTeammate =
                teammate;
        }
    }

    const playerDistance =
        Phaser.Math.Distance.Between(
            state.player.x,
            state.player.y,
            state.puck.x,
            state.puck.y
        );

    if (
        playerDistance <
        closestDistance * 0.82
    ) {
        return null;
    }

    return closestTeammate;
}

function moveTeammateTowardTarget(
    scene,
    teammate,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const deltaX =
        teammate.targetX -
        teammate.body.x;

    const deltaY =
        teammate.targetY -
        teammate.body.y;

    const distance =
        Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

    let targetVelocityX = 0;
    let targetVelocityY = 0;

    if (distance > 5) {
        const directionX =
            deltaX / distance;

        const directionY =
            deltaY / distance;

        let speed =
            teammate.maximumSpeed;

        if (distance < 45) {
            speed *=
                Phaser.Math.Clamp(
                    distance / 45,
                    0.28,
                    1
                );
        }

        if (
            state.possession.owner ===
            teammate
        ) {
            speed *= 0.94;
        }

        targetVelocityX =
            directionX * speed;

        targetVelocityY =
            directionY * speed;
    }

    const hasTarget =
        distance > 5;

    const changeRate =
        hasTarget
            ? teammate.acceleration
            : teammate.deceleration;

    teammate.velocityX =
        moveToward(
            teammate.velocityX,
            targetVelocityX,
            changeRate *
                deltaSeconds
        );

    teammate.velocityY =
        moveToward(
            teammate.velocityY,
            targetVelocityY,
            changeRate *
                deltaSeconds
        );

    const corrected =
        clampPointInsideRoundedRink(
            teammate.body.x +
                teammate.velocityX *
                deltaSeconds,

            teammate.body.y +
                teammate.velocityY *
                deltaSeconds,

            state.teammateRadius,
            state.rink
        );

    teammate.body.setPosition(
        corrected.x,
        corrected.y
    );

    if (corrected.hitX) {
        teammate.velocityX = 0;
    }

    if (corrected.hitY) {
        teammate.velocityY = 0;
    }

    separateTeammateFromPlayer(
        state,
        teammate
    );

    separateTeammates(
        state,
        teammate
    );
}

function separateTeammateFromPlayer(
    state,
    teammate
) {
    const deltaX =
        teammate.body.x -
        state.player.x;

    const deltaY =
        teammate.body.y -
        state.player.y;

    const distance =
        Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

    const minimumDistance =
        state.playerRadius +
        state.teammateRadius +
        4;

    if (
        distance >=
            minimumDistance ||
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

    teammate.body.x +=
        normalX *
        overlap *
        0.6;

    teammate.body.y +=
        normalY *
        overlap *
        0.6;
}

function separateTeammates(
    state,
    currentTeammate
) {
    for (
        const other
        of state.teammates
    ) {
        if (
            other ===
            currentTeammate
        ) {
            continue;
        }

        const deltaX =
            currentTeammate.body.x -
            other.body.x;

        const deltaY =
            currentTeammate.body.y -
            other.body.y;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        const minimumDistance =
            state.teammateRadius *
                2 +
            5;

        if (
            distance >=
                minimumDistance ||
            distance < 0.001
        ) {
            continue;
        }

        const normalX =
            deltaX / distance;

        const normalY =
            deltaY / distance;

        const overlap =
            minimumDistance -
            distance;

        currentTeammate.body.x +=
            normalX *
            overlap *
            0.5;

        currentTeammate.body.y +=
            normalY *
            overlap *
            0.5;
    }
}

function updateTeammateFacing(
    state,
    teammate,
    deltaSeconds
) {
    let desiredX = 0;
    let desiredY = -1;

    const ownsPuck =
        state.possession.owner ===
        teammate;

    if (ownsPuck) {
        const goal =
            state.offensiveGoal;

        desiredX =
            goal.x -
            teammate.body.x;

        desiredY =
            goal.y -
            teammate.body.y;
    } else {
        const movementSpeed =
            Math.sqrt(
                teammate.velocityX *
                    teammate.velocityX +
                teammate.velocityY *
                    teammate.velocityY
            );

        if (movementSpeed > 4) {
            desiredX =
                teammate.velocityX;

            desiredY =
                teammate.velocityY;
        } else {
            desiredX =
                state.puck.x -
                teammate.body.x;

            desiredY =
                state.puck.y -
                teammate.body.y;
        }
    }

    const desiredLength =
        Math.sqrt(
            desiredX * desiredX +
            desiredY * desiredY
        );

    if (desiredLength < 0.001) {
        return;
    }

    desiredX /=
        desiredLength;

    desiredY /=
        desiredLength;

    const currentAngle =
        Math.atan2(
            teammate.facingY,
            teammate.facingX
        );

    const targetAngle =
        Math.atan2(
            desiredY,
            desiredX
        );

    const difference =
        Phaser.Math.Angle.Wrap(
            targetAngle -
            currentAngle
        );

    const maximumTurn =
        teammate.turnSpeed *
        deltaSeconds;

    const newAngle =
        Phaser.Math.Angle.Wrap(
            currentAngle +
            Phaser.Math.Clamp(
                difference,
                -maximumTurn,
                maximumTurn
            )
        );

    teammate.facingX =
        Math.cos(newAngle);

    teammate.facingY =
        Math.sin(newAngle);
}

function updateTeammateVisuals(
    teammate
) {
    teammate.label.setPosition(
        teammate.body.x,
        teammate.body.y - 19
    );

    updateTeammateStick(
        teammate
    );
}

/* =========================================================
   TEAMMATE STICKS
========================================================= */

function getTeammateStickGeometry(
    teammate
) {
    const perpendicularX =
        -teammate.facingY;

    const perpendicularY =
        teammate.facingX;

    const bladeStartX =
        teammate.body.x +
        teammate.facingX * 23 +
        perpendicularX * 7;

    const bladeStartY =
        teammate.body.y +
        teammate.facingY * 23 +
        perpendicularY * 7;

    const bladeEndX =
        bladeStartX +
        perpendicularX * 8;

    const bladeEndY =
        bladeStartY +
        perpendicularY * 8;

    return {
        bladeStartX,
        bladeStartY,

        bladeEndX,
        bladeEndY,

        puckAnchorX:
            bladeStartX +
            perpendicularX * 4,

        puckAnchorY:
            bladeStartY +
            perpendicularY * 4,

        perpendicularX,
        perpendicularY
    };
}

function updateTeammateStick(
    teammate
) {
    const geometry =
        getTeammateStickGeometry(
            teammate
        );

    const handX =
        teammate.body.x +
        teammate.facingX * 5 +
        geometry.perpendicularX * 5;

    const handY =
        teammate.body.y +
        teammate.facingY * 5 +
        geometry.perpendicularY * 5;

    teammate.stick.clear();

    teammate.stick.lineStyle(
        3,
        0x6e4524,
        1
    );

    teammate.stick.lineBetween(
        handX,
        handY,
        geometry.bladeStartX,
        geometry.bladeStartY
    );

    teammate.stick.lineStyle(
        4,
        0x222222,
        1
    );

    teammate.stick.lineBetween(
        geometry.bladeStartX,
        geometry.bladeStartY,
        geometry.bladeEndX,
        geometry.bladeEndY
    );
}

function updateTeammateIndicators(
    scene
) {
    const state =
        scene.gameState;

    const target =
        state.aim.active
            ? findPassTarget(
                state,
                state.aim.directionX,
                state.aim.directionY
            )
            : null;

    for (
        const teammate
        of state.teammates
    ) {
        teammate.targetRing.clear();

        if (teammate === target) {
            teammate.targetRing
                .lineStyle(
                    3,
                    0x28e7ff,
                    0.95
                );

            teammate.targetRing
                .strokeCircle(
                    teammate.body.x,
                    teammate.body.y,
                    16
                );
        }
    }
}

/* =========================================================
   PUCK
========================================================= */

function createPuck(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

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
   POSSESSION
========================================================= */

function updatePossession(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const possession =
        state.possession;

    possession.pickupCooldown =
        Math.max(
            0,
            possession.pickupCooldown -
                deltaSeconds
        );

    if (!possession.owner) {
        return;
    }

    hardLockPossessedPuck(scene);

    if (
        possession.owner ===
        state.player
    ) {
        return;
    }

    updateAIPuckDecision(
        scene,
        possession.owner,
        deltaSeconds
    );
}

function updateAIPuckDecision(
    scene,
    teammate,
    deltaSeconds
) {
    const state =
        scene.gameState;

    teammate.possessionTime +=
        deltaSeconds;

    teammate.decisionTimer -=
        deltaSeconds;

    if (
        teammate.decisionTimer > 0
    ) {
        return;
    }

    teammate.decisionTimer =
        Phaser.Math.FloatBetween(
            0.45,
            0.85
        );

    const goal =
        state.offensiveGoal;

    const distanceToGoal =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            goal.x,
            goal.y
        );

    const centrality =
        1 -
        Phaser.Math.Clamp(
            Math.abs(
                teammate.body.x -
                goal.x
            ) / 120,
            0,
            1
        );

    let shotChance = 0;

    if (distanceToGoal < 85) {
        shotChance =
            0.82;
    } else if (
        distanceToGoal < 125
    ) {
        shotChance =
            0.56 +
            centrality * 0.18;
    } else if (
        distanceToGoal < 180
    ) {
        shotChance =
            0.18 +
            centrality * 0.15;
    }

    if (
        teammate.possessionTime >
        2.4
    ) {
        shotChance += 0.18;
    }

    if (
        Math.random() <
        shotChance
    ) {
        shootFromTeammate(
            scene,
            teammate
        );

        return;
    }

    const passTarget =
        chooseAIPassTarget(
            state,
            teammate
        );

    const forceDecision =
        teammate.possessionTime >
        2.9;

    const shouldPass =
        passTarget &&
        (
            Math.random() < 0.43 ||
            forceDecision
        );

    if (shouldPass) {
        passFromTeammate(
            scene,
            teammate,
            passTarget
        );
    }
}

function chooseAIPassTarget(
    state,
    teammate
) {
    const candidates = [];

    candidates.push({
        type: "player",
        target: state.player,
        x:
            getPlayerStickGeometry(
                state
            ).puckAnchorX,

        y:
            getPlayerStickGeometry(
                state
            ).puckAnchorY
    });

    for (
        const other
        of state.teammates
    ) {
        if (other === teammate) {
            continue;
        }

        const geometry =
            getTeammateStickGeometry(
                other
            );

        candidates.push({
            type: "teammate",
            target: other,
            x:
                geometry.puckAnchorX,

            y:
                geometry.puckAnchorY
        });
    }

    let best = null;
    let bestScore =
        -Infinity;

    for (
        const candidate
        of candidates
    ) {
        const deltaX =
            candidate.x -
            teammate.body.x;

        const deltaY =
            candidate.y -
            teammate.body.y;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (
            distance < 45 ||
            distance > 250
        ) {
            continue;
        }

        const forwardProgress =
            teammate.body.y -
            candidate.y;

        const spacingScore =
            Math.min(
                distance / 130,
                1
            );

        let score =
            forwardProgress * 0.015 +
            spacingScore;

        if (
            candidate.type ===
            "player"
        ) {
            score +=
                Math.random() * 0.65;
        } else {
            score +=
                Math.random() * 0.8;
        }

        if (
            candidate.y <
            teammate.body.y
        ) {
            score += 0.35;
        }

        if (score > bestScore) {
            bestScore = score;
            best = candidate;
        }
    }

    return best;
}

function shootFromTeammate(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        teammate
    ) {
        return;
    }

    const geometry =
        getTeammateStickGeometry(
            teammate
        );

    const goal =
        state.offensiveGoal;

    const targetX =
        goal.x +
        Phaser.Math.Between(
            -15,
            15
        );

    const targetY =
        goal.y - 5;

    let directionX =
        targetX -
        geometry.puckAnchorX;

    let directionY =
        targetY -
        geometry.puckAnchorY;

    const distance =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (distance < 0.001) {
        return;
    }

    directionX /=
        distance;

    directionY /=
        distance;

    const shotSpeed =
        Phaser.Math.Between(
            350,
            475
        );

    releasePossession(
        state,
        0.24
    );

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

    state.puckVelocityX =
        directionX *
        shotSpeed +
        teammate.velocityX *
        0.07;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        teammate.velocityY *
        0.07;

    teammate.possessionTime = 0;
}

function passFromTeammate(
    scene,
    teammate,
    passTarget
) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        teammate
    ) {
        return;
    }

    const startGeometry =
        getTeammateStickGeometry(
            teammate
        );

    let targetX;
    let targetY;

    if (
        passTarget.type ===
        "player"
    ) {
        const playerGeometry =
            getPlayerStickGeometry(
                state
            );

        targetX =
            playerGeometry.puckAnchorX;

        targetY =
            playerGeometry.puckAnchorY;
    } else {
        const teammateGeometry =
            getTeammateStickGeometry(
                passTarget.target
            );

        targetX =
            teammateGeometry.puckAnchorX;

        targetY =
            teammateGeometry.puckAnchorY;
    }

    let directionX =
        targetX -
        startGeometry.puckAnchorX;

    let directionY =
        targetY -
        startGeometry.puckAnchorY;

    const distance =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (distance < 0.001) {
        return;
    }

    directionX /=
        distance;

    directionY /=
        distance;

    const passSpeed =
        Phaser.Math.Clamp(
            230 +
            distance * 0.62,
            245,
            380
        );

    releasePossession(
        state,
        0.16
    );

    state.possession.passTarget =
        passTarget.target;

    state.possession.passTargetType =
        passTarget.type;

    state.puck.setPosition(
        startGeometry.puckAnchorX,
        startGeometry.puckAnchorY
    );

    state.puckVelocityX =
        directionX *
        passSpeed;

    state.puckVelocityY =
        directionY *
        passSpeed;

    teammate.possessionTime = 0;
}

function hardLockPossessedPuck(
    scene
) {
    const state =
        scene.gameState;

    const owner =
        state.possession.owner;

    if (!owner) {
        return;
    }

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    if (
        owner ===
        state.player
    ) {
        const geometry =
            getPlayerStickGeometry(
                state
            );

        state.puck.setPosition(
            geometry.puckAnchorX,
            geometry.puckAnchorY
        );

        return;
    }

    const geometry =
        getTeammateStickGeometry(
            owner
        );

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );
}

function checkForPuckPickup(
    scene
) {
    const state =
        scene.gameState;

    const possession =
        state.possession;

    if (
        possession.owner ||
        possession.pickupCooldown > 0
    ) {
        return;
    }

    if (
        possession.passTargetType ===
            "player" &&
        possession.passTarget ===
            state.player
    ) {
        const geometry =
            getPlayerStickGeometry(
                state
            );

        const distance =
            Phaser.Math.Distance.Between(
                state.puck.x,
                state.puck.y,
                geometry.puckAnchorX,
                geometry.puckAnchorY
            );

        if (distance <= 23) {
            givePuckToPlayer(
                scene
            );

            return;
        }
    }

    if (
        possession.passTargetType ===
            "teammate" &&
        possession.passTarget
    ) {
        const geometry =
            getTeammateStickGeometry(
                possession.passTarget
            );

        const distance =
            Phaser.Math.Distance.Between(
                state.puck.x,
                state.puck.y,
                geometry.puckAnchorX,
                geometry.puckAnchorY
            );

        if (distance <= 23) {
            givePuckToTeammate(
                scene,
                possession.passTarget
            );

            return;
        }
    }

    const candidates = [];

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    candidates.push({
        type: "player",
        target: state.player,

        distance:
            distanceFromPointToSegment(
                state.puck.x,
                state.puck.y,

                playerGeometry.bladeStartX,
                playerGeometry.bladeStartY,

                playerGeometry.bladeEndX,
                playerGeometry.bladeEndY
            )
    });

    for (
        const teammate
        of state.teammates
    ) {
        const geometry =
            getTeammateStickGeometry(
                teammate
            );

        candidates.push({
            type: "teammate",
            target: teammate,

            distance:
                distanceFromPointToSegment(
                    state.puck.x,
                    state.puck.y,

                    geometry.bladeStartX,
                    geometry.bladeStartY,

                    geometry.bladeEndX,
                    geometry.bladeEndY
                )
        });
    }

    candidates.sort(
        (
            first,
            second
        ) =>
            first.distance -
            second.distance
    );

    const closest =
        candidates[0];

    if (
        !closest ||
        closest.distance >
        possession.pickupRadius
    ) {
        return;
    }

    if (
        closest.type ===
        "player"
    ) {
        givePuckToPlayer(scene);
    } else {
        givePuckToTeammate(
            scene,
            closest.target
        );
    }
}

function givePuckToPlayer(
    scene
) {
    const state =
        scene.gameState;

    state.possession.owner =
        state.player;

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    hardLockPossessedPuck(scene);
}

function givePuckToTeammate(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    state.possession.owner =
        teammate;

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    teammate.possessionTime = 0;

    teammate.decisionTimer =
        Phaser.Math.FloatBetween(
            0.55,
            1.1
        );

    hardLockPossessedPuck(scene);
}

function releasePossession(
    state,
    cooldown = 0.18
) {
    state.possession.owner =
        null;

    state.possession.pickupCooldown =
        cooldown;
}

/* =========================================================
   MOBILE CONTROLS
========================================================= */

function createMobileControls(
    scene
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    const controlsY =
        Math.min(
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
        rink.right - 58,
        controlsY - 78
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

    movement.base =
        scene.add.circle(
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

    movement.knob =
        scene.add.circle(
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

    const hitArea =
        scene.add.circle(
            x,
            y,
            movement.baseRadius +
                14,
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

            movement.base
                .setFillStyle(
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

    aim.base =
        scene.add.circle(
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

    aim.knob =
        scene.add.circle(
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

    aim.label =
        scene.add.text(
            x,
            y,
            "SHOOT/\nPASS",
            {
                font:
                    "bold 8px Arial",

                fill:
                    "#ffffff",

                align:
                    "center",

                lineSpacing:
                    -2
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

    const hitArea =
        scene.add.circle(
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

            aim.base
                .setFillStyle(
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

/* =========================================================
   SPRINT BUTTON
========================================================= */

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
            92,
            36,
            0x1769d2,
            0.94
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

    const label =
        scene.add.text(
            x,
            y,
            "SPRINT OFF",
            {
                font:
                    "bold 11px Arial",

                fill:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(111)
            .setInteractive({
                useHandCursor: true
            });

    state.sprintButton = {
        button,
        label
    };

    const toggleSprint = (
        pointer,
        localX,
        localY,
        event
    ) => {
        state.sprinting =
            !state.sprinting;

        updateSprintButtonAppearance(
            scene
        );

        if (
            event &&
            event.stopPropagation
        ) {
            event.stopPropagation();
        }
    };

    button.on(
        "pointerdown",
        toggleSprint
    );

    label.on(
        "pointerdown",
        toggleSprint
    );
}

function updateSprintButtonAppearance(
    scene
) {
    const state =
        scene.gameState;

    const sprintButton =
        state.sprintButton;

    if (!sprintButton) {
        return;
    }

    if (state.sprinting) {
        sprintButton.button
            .setFillStyle(
                0x35a85d,
                1
            )
            .setScale(1.04);

        sprintButton.label
            .setText(
                "SPRINT ON"
            )
            .setScale(1.04);
    } else {
        sprintButton.button
            .setFillStyle(
                0x1769d2,
                0.94
            )
            .setScale(1);

        sprintButton.label
            .setText(
                "SPRINT OFF"
            )
            .setScale(1);
    }
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

    const distance =
        Math.sqrt(
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

    resetMovementJoystick(
        scene
    );
}

function resetMovementJoystick(
    scene
) {
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
        aim.pointerId !==
            pointer.id
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

    const aim =
        state.aim;

    const deltaX =
        pointer.x -
        aim.centerX;

    const deltaY =
        pointer.y -
        aim.centerY;

    const distance =
        Math.sqrt(
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
        aim.pointerId !==
            pointer.id
    ) {
        return;
    }

    if (
        shouldShoot &&
        aim.strength > 0.08
    ) {
        useShotControl(scene);
    }

    resetAimJoystick(scene);
}

function resetAimJoystick(
    scene
) {
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

function cancelJoysticks(scene) {
    if (
        !scene ||
        !scene.gameState
    ) {
        return;
    }

    resetMovementJoystick(scene);
    resetAimJoystick(scene);
}

/* =========================================================
   KEYBOARD
========================================================= */

function createKeyboardControls(
    scene
) {
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
            scene.input.keyboard
                .addKeys({
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

function updateKeyboardInput(
    scene
) {
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
        const length =
            Math.sqrt(
                directionX *
                    directionX +
                directionY *
                    directionY
            );

        state.movement.directionX =
            directionX / length;

        state.movement.directionY =
            directionY / length;

        state.movement.strength = 1;

        if (!state.aim.active) {
            state.targetFacingAngle =
                Math.atan2(
                    state.movement
                        .directionY,

                    state.movement
                        .directionX
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
        Phaser.Input.Keyboard
            .JustDown(
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
        movement.strength >
        0.01;

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
   PLAYER STICK
========================================================= */

function getPlayerStickGeometry(
    state
) {
    const perpendicularX =
        -state.facingY;

    const perpendicularY =
        state.facingX;

    const bladeStartX =
        state.player.x +
        state.facingX * 25 +
        perpendicularX * 8;

    const bladeStartY =
        state.player.y +
        state.facingY * 25 +
        perpendicularY * 8;

    const bladeEndX =
        bladeStartX +
        perpendicularX * 9;

    const bladeEndY =
        bladeStartY +
        perpendicularY * 9;

    const puckAnchorX =
        bladeStartX +
        perpendicularX * 4.5;

    const puckAnchorY =
        bladeStartY +
        perpendicularY * 4.5;

    return {
        perpendicularX,
        perpendicularY,

        bladeStartX,
        bladeStartY,

        bladeEndX,
        bladeEndY,

        puckAnchorX,
        puckAnchorY
    };
}

function updatePlayerStick(
    scene
) {
    const state =
        scene.gameState;

    if (
        !state.player ||
        !state.playerStick
    ) {
        return;
    }

    const geometry =
        getPlayerStickGeometry(
            state
        );

    const handX =
        state.player.x +
        state.facingX * 6 +
        geometry.perpendicularX * 6;

    const handY =
        state.player.y +
        state.facingY * 6 +
        geometry.perpendicularY * 6;

    state.playerStick.clear();

    state.playerStick.lineStyle(
        3,
        0x6e4524,
        1
    );

    state.playerStick.lineBetween(
        handX,
        handY,
        geometry.bladeStartX,
        geometry.bladeStartY
    );

    state.playerStick.lineStyle(
        4,
        0x222222,
        1
    );

    state.playerStick.lineBetween(
        geometry.bladeStartX,
        geometry.bladeStartY,
        geometry.bladeEndX,
        geometry.bladeEndY
    );
}

/* =========================================================
   PLAYER SHOOTING AND PASSING
========================================================= */

function findPassTarget(
    state,
    directionX,
    directionY
) {
    if (
        state.possession.owner !==
        state.player
    ) {
        return null;
    }

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const minimumDot =
        Math.cos(
            Phaser.Math.DegToRad(
                18
            )
        );

    let bestTarget = null;
    let bestDot = minimumDot;

    for (
        const teammate
        of state.teammates
    ) {
        const geometry =
            getTeammateStickGeometry(
                teammate
            );

        const deltaX =
            geometry.puckAnchorX -
            playerGeometry.puckAnchorX;

        const deltaY =
            geometry.puckAnchorY -
            playerGeometry.puckAnchorY;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance < 1) {
            continue;
        }

        const targetDirectionX =
            deltaX / distance;

        const targetDirectionY =
            deltaY / distance;

        const dot =
            directionX *
                targetDirectionX +
            directionY *
                targetDirectionY;

        if (dot > bestDot) {
            bestDot = dot;
            bestTarget = teammate;
        }
    }

    return bestTarget;
}

function useShotControl(scene) {
    const state =
        scene.gameState;

    const aim =
        state.aim;

    if (
        state.possession.owner !==
        state.player
    ) {
        return;
    }

    const passTarget =
        findPassTarget(
            state,
            aim.directionX,
            aim.directionY
        );

    if (passTarget) {
        passPuckToTeammate(
            scene,
            passTarget,
            aim.strength
        );

        return;
    }

    const shotSpeed =
        80 +
        aim.strength * 420;

    shootPuckInDirection(
        scene,
        aim.directionX,
        aim.directionY,
        shotSpeed
    );
}

function passPuckToTeammate(
    scene,
    teammate,
    strength
) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        state.player
    ) {
        return;
    }

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const targetGeometry =
        getTeammateStickGeometry(
            teammate
        );

    const deltaX =
        targetGeometry.puckAnchorX -
        playerGeometry.puckAnchorX;

    const deltaY =
        targetGeometry.puckAnchorY -
        playerGeometry.puckAnchorY;

    const distance =
        Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

    if (distance < 0.001) {
        return;
    }

    const directionX =
        deltaX / distance;

    const directionY =
        deltaY / distance;

    const passSpeed =
        220 +
        strength * 160;

    releasePossession(
        state,
        0.18
    );

    state.possession.passTarget =
        teammate;

    state.possession.passTargetType =
        "teammate";

    state.puck.setPosition(
        playerGeometry.puckAnchorX,
        playerGeometry.puckAnchorY
    );

    state.puckVelocityX =
        directionX *
        passSpeed;

    state.puckVelocityY =
        directionY *
        passSpeed;
}

function shootPuckInDirection(
    scene,
    directionX,
    directionY,
    shotSpeed
) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        state.player
    ) {
        return;
    }

    const directionLength =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (
        directionLength <
        0.001
    ) {
        return;
    }

    directionX /=
        directionLength;

    directionY /=
        directionLength;

    const geometry =
        getPlayerStickGeometry(
            state
        );

    releasePossession(
        state,
        0.22
    );

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

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
   AIM GUIDE
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

    const geometry =
        getPlayerStickGeometry(
            state
        );

    const passTarget =
        findPassTarget(
            state,
            aim.directionX,
            aim.directionY
        );

    const hasPuck =
        state.possession.owner ===
        state.player;

    let guideColor;

    if (!hasPuck) {
        guideColor =
            0xff3b30;
    } else if (passTarget) {
        guideColor =
            0x28e7ff;
    } else {
        guideColor =
            0xffd21f;
    }

    const guideLength =
        40 +
        aim.strength * 105;

    const endX =
        geometry.puckAnchorX +
        aim.directionX *
        guideLength;

    const endY =
        geometry.puckAnchorY +
        aim.directionY *
        guideLength;

    aim.guide.lineStyle(
        2 +
            aim.strength * 3,
        guideColor,
        0.88
    );

    aim.guide.lineBetween(
        geometry.puckAnchorX,
        geometry.puckAnchorY,
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

    const barWidth = 76;
    const barHeight = 8;

    const barX =
        aim.centerX -
        barWidth / 2;

    const barY =
        aim.centerY - 60;

    aim.powerBar.fillStyle(
        0x111111,
        0.72
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

/* =========================================================
   PUCK MOVEMENT
========================================================= */

function updatePuckMovement(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const puck =
        state.puck;

    const travelX =
        state.puckVelocityX *
        deltaSeconds;

    const travelY =
        state.puckVelocityY *
        deltaSeconds;

    const travelDistance =
        Math.sqrt(
            travelX * travelX +
            travelY * travelY
        );

    const steps =
        Math.max(
            1,
            Math.ceil(
                travelDistance /
                0.65
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

        checkForPuckPickup(
            scene
        );

        if (
            state.possession.owner
        ) {
            hardLockPossessedPuck(
                scene
            );

            break;
        }
    }

    if (
        state.possession.owner
    ) {
        return;
    }

    const friction =
        Math.pow(
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
   GOAL GEOMETRY
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

/* =========================================================
   GOAL COLLISIONS
========================================================= */

function handleGoalNetCollisions(
    scene
) {
    const state =
        scene.gameState;

    const puck =
        state.puck;

    if (
        state.possession.owner
    ) {
        return;
    }

    const geometry =
        getGoalGeometry(
            state
        );

    for (
        const [postX, postY]
        of geometry.posts
    ) {
        resolvePuckCircleCollision(
            state,
            puck,
            postX,
            postY,
            state.puckRadius +
                3.5,
            0.72
        );
    }

    for (
        const segment
        of geometry.segments
    ) {
        resolvePuckSegmentCollision(
            state,
            puck,
            segment[0],
            segment[1],
            segment[2],
            segment[3]
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

    if (
        lengthSquared <= 0
    ) {
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
                ) *
                segmentX +
                (
                    pointY - y1
                ) *
                segmentY
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

function distanceFromPointToSegment(
    pointX,
    pointY,
    x1,
    y1,
    x2,
    y2
) {
    const closest =
        closestPointOnSegment(
            pointX,
            pointY,
            x1,
            y1,
            x2,
            y2
        );

    return Phaser.Math.Distance.Between(
        pointX,
        pointY,
        closest.x,
        closest.y
    );
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

    if (
        closest.t < 0.1 ||
        closest.t > 0.9
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
        state.puckRadius +
        1.4;

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
                segmentX *
                    segmentX +
                segmentY *
                    segmentY
            ) || 1;

        normalX =
            -segmentY /
            segmentLength;

        normalY =
            segmentX /
            segmentLength;

        const velocityDot =
            state.puckVelocityX *
                normalX +
            state.puckVelocityY *
                normalY;

        if (velocityDot > 0) {
            normalX *= -1;
            normalY *= -1;
        }

        distance = 0;
    }

    const overlap =
        collisionRadius -
        distance;

    puck.x +=
        normalX *
        (
            overlap +
            0.15
        );

    puck.y +=
        normalY *
        (
            overlap +
            0.15
        );

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (
        velocityAlongNormal <
        0
    ) {
        const restitution =
            0.34;

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
            0.35
        );

    puck.y +=
        normalY *
        (
            overlap +
            0.35
        );

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (
        velocityAlongNormal <
        0
    ) {
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

    if (
        isLeft &&
        isTop
    ) {
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

        const distance =
            Math.sqrt(
                deltaX *
                    deltaX +
                deltaY *
                    deltaY
            );

        if (
            distance >
                innerCornerRadius &&
            distance > 0
        ) {
            const normalX =
                deltaX /
                distance;

            const normalY =
                deltaY /
                distance;

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

            correctedX =
                newX;

            correctedY =
                newY;
        }
    }

    return {
        x: correctedX,
        y: correctedY,
        hitX,
        hitY
    };
}