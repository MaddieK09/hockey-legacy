(() => {
"use strict";

/* =========================================================
   HOCKEY LEGACY
   VERSION 0.0.80

   CONTROLS
   - Left joystick: skate
   - Right joystick: always shoot
   - PASS button: pass while you have the puck
   - CALL PASS button: request puck from teammate
   - Sprint button: toggle sprint
   - Player starts with puck after every restart
   - Offensive goal is the top goal
========================================================= */

const config = {
    type: Phaser.AUTO,

    parent: "game",

    width: window.innerWidth,
    height: window.innerHeight,

    backgroundColor: "#d8f0ff",

    antialias: true,
    pixelArt: false,
    roundPixels: true,

    render: {
        antialias: true,
        antialiasGL: true,
        pixelArt: false,
        roundPixels: true,
        transparent: false,
        powerPreference: "high-performance"
    },

    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        width: window.innerWidth,
        height: window.innerHeight
    },

    input: {
        activePointers: 5,

        touch: {
            capture: true
        }
    },

    scene: {
        create,
        update
    }
};

/*
 * Keep the entire game isolated from variables created by index.html
 * or by an older cached copy of main.js.
 */
let hockeyLegacyGame = null;

try {
    if (
        typeof Phaser === "undefined"
    ) {
        throw new Error(
            "Phaser is not available"
        );
    }

    hockeyLegacyGame =
        new Phaser.Game(config);

    window.hockeyLegacyGame =
        hockeyLegacyGame;

    window.hockeyLegacyMainLoaded =
        true;
} catch (error) {
    console.error(
        "Hockey Legacy startup failed:",
        error
    );

    const status =
        document.getElementById(
            "loading-status"
        );

    if (status) {
        status.style.background =
            "#8f1515";

        status.textContent =
            "STARTUP ERROR: " +
            (
                error &&
                error.message
                    ? error.message
                    : String(error)
            );
    }

    throw error;
}

/* =========================================================
   CREATE
========================================================= */

function create() {
    const scene = this;

    scene.cameras.main
        .setRoundPixels(true);

    const screenWidth =
        scene.scale.width;

    const screenHeight =
        scene.scale.height;

    const rink = {
        width: Math.min(
            330,
            screenWidth - 18
        ),

        height: Math.min(
            610,
            screenHeight - 22
        ),

        cornerRadius: 55
    };

    rink.centerX =
        Math.round(
            screenWidth / 2
        );

    rink.centerY =
        Math.round(
            screenHeight / 2
        );

    rink.left =
        Math.round(
            rink.centerX -
            rink.width / 2
        );

    rink.right =
        Math.round(
            rink.centerX +
            rink.width / 2
        );

    rink.top =
        Math.round(
            rink.centerY -
            rink.height / 2
        );

    rink.bottom =
        Math.round(
            rink.centerY +
            rink.height / 2
        );

    scene.gameState = {
        rink,

        gameStarted: false,
        playStopped: false,

        player: null,
        playerStick: null,
        playerIndicator: null,

        teammates: [],

        puck: null,

        goalie: {
            body: null,
            mask: null,
            pads: null,
            glove: null,
            blocker: null,
            stick: null,
            label: null,

            x: rink.centerX,
            y: rink.top + 63,

            homeX: rink.centerX,
            homeY: rink.top + 63,

            velocityX: 0,
            maximumSpeed: 76,
            acceleration: 335,
            deceleration: 470,

            visualWidth: 19,
            visualHeight: 18,

            saveHalfWidth: 6.5,
            saveHalfHeight: 8,

            reactionTimer: 0,
            reactionDelay: 0.18,
            trackedTargetX: rink.centerX,
            trackingError: 0,

            saveCooldown: 0,
            saveFlash: null
        },

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

        keyboard: null,

        playerStats: {
            enabled: false,

            shots: 0,
            goals: 0,
            assists: 0,
            points: 0,
            passes: 0,
            savesAgainst: 0,

            panel: null,
            title: null,
            text: null,

            lastShooter: null,
            lastPasser: null
        },

        offensiveGoal: {
            x: rink.centerX,
            y: rink.top + 44
        },

        score: {
            top: 0,
            bottom: 0,

            panel: null,
            label: null,
            text: null
        },

        possession: {
            owner: null,

            pickupRadius: 22,
            pickupCooldown: 0,

            passTarget: null,
            passTargetType: null
        },

        goalPresentation: {
            active: false,
            scoredSide: null,

            topLight: null,
            bottomLight: null,

            topGlow: null,
            bottomGlow: null,

            banner: null,
            subtext: null,
            countdownText: null,

            resetTimer: null
        },

        actionButton: {
            button: null,
            label: null,

            cooldown: 0,
            cooldownLength: 0.65,

            flashTimer: null
        },

        passCall: {
            active: false,
            displayTimer: 0,

            ring: null,
            text: null
        },

        sprintButton: {
            button: null,
            label: null
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

    createMainMenu(scene);

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

    window.addEventListener(
        "contextmenu",
        event => {
            event.preventDefault();
        }
    );
}

/* =========================================================
   MAIN MENU
========================================================= */

function createMainMenu(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    const titleY =
        Math.max(
            120,
            rink.centerY - 175
        );

    const versionY =
        titleY + 78;

    const toggleY =
        versionY + 70;

    const buttonY =
        versionY + 145;

    const titleText =
        scene.add.text(
            rink.centerX,
            titleY,
            "HOCKEY LEGACY",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "38px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                stroke:
                    "#0b2d52",

                strokeThickness:
                    5,

                align:
                    "center"
            }
        )
            .setOrigin(0.5)
            .setDepth(300);

    const versionText =
        scene.add.text(
            rink.centerX,
            versionY,
            "Version 0.0.80",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "22px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(300);

    const statsToggleButton =
        scene.add.rectangle(
            rink.centerX,
            toggleY,
            210,
            46,
            0x596a7b,
            0.96
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
            )
            .setDepth(300)
            .setInteractive({
                useHandCursor: true
            });

    const statsToggleText =
        scene.add.text(
            rink.centerX,
            toggleY,
            "PLAYER STATS: OFF",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "18px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

    const togglePlayerStats = (
        pointer,
        localX,
        localY,
        event
    ) => {
        if (state.gameStarted) {
            return;
        }

        state.playerStats.enabled =
            !state.playerStats.enabled;

        if (
            state.playerStats.enabled
        ) {
            statsToggleButton
                .setFillStyle(
                    0x35a85d,
                    1
                );

            statsToggleText
                .setText(
                    "PLAYER STATS: ON"
                );
        } else {
            statsToggleButton
                .setFillStyle(
                    0x596a7b,
                    0.96
                );

            statsToggleText
                .setText(
                    "PLAYER STATS: OFF"
                );
        }

        if (
            event &&
            event.stopPropagation
        ) {
            event.stopPropagation();
        }
    };

    statsToggleButton.on(
        "pointerdown",
        togglePlayerStats
    );

    statsToggleText.on(
        "pointerdown",
        togglePlayerStats
    );

    const button =
        scene.add.rectangle(
            rink.centerX,
            buttonY,
            190,
            66,
            0x17375e,
            0.98
        )
            .setStrokeStyle(
                3,
                0xffffff,
                1
            )
            .setDepth(300)
            .setInteractive({
                useHandCursor: true
            });

    const buttonText =
        scene.add.text(
            rink.centerX,
            buttonY,
            "â¶ PLAY",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "32px",

                fontStyle:
                    "bold",

                color:
                    "#ffff00"
            }
        )
            .setOrigin(0.5)
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

    const startGame = (
        pointer,
        localX,
        localY,
        event
    ) => {
        if (state.gameStarted) {
            return;
        }

        state.gameStarted = true;

        button.disableInteractive();
        buttonText.disableInteractive();

        statsToggleButton
            .disableInteractive();

        statsToggleText
            .disableInteractive();

        titleText.setVisible(false);
        versionText.setVisible(false);

        button.setVisible(false);
        buttonText.setVisible(false);

        statsToggleButton
            .setVisible(false);

        statsToggleText
            .setVisible(false);

        drawRink(
            scene,
            rink
        );

        createGoalPresentation(
            scene
        );

        createScoreboard(
            scene
        );

        createPlayerStatsDisplay(
            scene
        );

        createPlayer(
            scene
        );

        createTeammates(
            scene
        );

        createPuck(
            scene
        );

        createGoalie(
            scene
        );

        createMobileControls(
            scene
        );

        createKeyboardControls(
            scene
        );

        createPassCallVisuals(
            scene
        );

        resetPlayersForCenterFaceoff(
            scene,
            false
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
        startGame
    );

    buttonText.on(
        "pointerdown",
        startGame
    );
}

/* =========================================================
   UPDATE
========================================================= */

function update(
    time,
    delta
) {
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

    updateActionButtonState(
        this,
        deltaSeconds
    );

    updatePassCallState(
        this,
        deltaSeconds
    );

    if (
        state.playStopped ||
        state.goalPresentation.active
    ) {
        freezeGameplayDuringGoal(
            this
        );

        updatePlayerStick(
            this
        );

        updatePlayerIndicator(
            this
        );

        updateTeammateIndicators(
            this
        );

        updatePassCallVisuals(
            this
        );

        updateContextualActionButton(
            this
        );

        return;
    }

    updateKeyboardInput(
        this
    );

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

    updatePlayerStick(
        this
    );

    updatePlayerIndicator(
        this
    );

    updateTeammateAI(
        this,
        deltaSeconds
    );

    updateGoalie(
        this,
        deltaSeconds
    );

    updatePossession(
        this,
        deltaSeconds
    );

    if (
        !state.possession.owner
    ) {
        updatePuckMovement(
            this,
            deltaSeconds
        );
    }

    if (
        !state.playStopped &&
        !state.possession.owner
    ) {
        checkForPuckPickup(
            this
        );
    }

    if (
        state.possession.owner &&
        !state.playStopped
    ) {
        hardLockPossessedPuck(
            this
        );
    }

    updateAimGuide(
        this
    );

    updateTeammateIndicators(
        this
    );

    updatePassCallVisuals(
        this
    );

    updateContextualActionButton(
        this
    );
}

/* =========================================================
   SCOREBOARD
========================================================= */

function createScoreboard(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    const scoreboardX =
        rink.left + 48;

    const scoreboardY =
        rink.top + 24;

    state.score.panel =
        scene.add.rectangle(
            scoreboardX,
            scoreboardY,
            78,
            32,
            0x102d4e,
            0.95
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(150);

    state.score.label =
        scene.add.text(
            scoreboardX,
            scoreboardY - 21,
            "SCORE",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "9px",

                fontStyle:
                    "bold",

                color:
                    "#123d5f",

                backgroundColor:
                    "#ffffff",

                padding: {
                    left: 5,
                    right: 5,
                    top: 2,
                    bottom: 2
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(151);

    state.score.text =
        scene.add.text(
            scoreboardX,
            scoreboardY,
            "0 - 0",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "18px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(151);
}

function updateScoreboard(scene) {
    const state =
        scene.gameState;

    if (!state.score.text) {
        return;
    }

    state.score.text.setText(
        `${state.score.top} - ${state.score.bottom}`
    );
}

/* =========================================================
   PLAYER STATS DISPLAY
========================================================= */

function createPlayerStatsDisplay(
    scene
) {
    const state =
        scene.gameState;

    const stats =
        state.playerStats;

    if (
        !stats.enabled
    ) {
        return;
    }

    const rink =
        state.rink;

    const panelX =
        rink.right - 51;

    const panelY =
        rink.top + 38;

    stats.panel =
        scene.add.rectangle(
            panelX,
            panelY,
            94,
            62,
            0x102d4e,
            0.92
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(150);

    stats.title =
        scene.add.text(
            panelX,
            panelY - 23,
            "PLAYER",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "9px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(151);

    stats.text =
        scene.add.text(
            panelX,
            panelY + 6,
            "",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "10px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                align:
                    "center",

                lineSpacing:
                    1
            }
        )
            .setOrigin(0.5)
            .setDepth(151);

    updatePlayerStatsDisplay(
        scene
    );
}

function updatePlayerStatsDisplay(
    scene
) {
    const stats =
        scene.gameState
            .playerStats;

    stats.points =
        stats.goals +
        stats.assists;

    if (
        !stats.enabled ||
        !stats.text
    ) {
        return;
    }

    stats.text.setText(
        `G ${stats.goals}   A ${stats.assists}   P ${stats.points}\n` +
        `S ${stats.shots}   PAS ${stats.passes}`
    );
}

function recordPlayerShot(
    scene
) {
    const stats =
        scene.gameState
            .playerStats;

    stats.shots += 1;
    stats.lastShooter = "player";
    stats.lastPasser = null;

    updatePlayerStatsDisplay(
        scene
    );
}

function recordPlayerPass(
    scene
) {
    const stats =
        scene.gameState
            .playerStats;

    stats.passes += 1;
    stats.lastPasser = "player";

    updatePlayerStatsDisplay(
        scene
    );
}

/* =========================================================
   RINK DRAWING
========================================================= */

function drawRink(
    scene,
    rink
) {
    const graphics =
        scene.add.graphics();

    graphics.setDepth(1);

    graphics.fillStyle(
        0xf6fbff,
        1
    );

    graphics.fillRoundedRect(
        rink.left,
        rink.top,
        rink.width,
        rink.height,
        rink.cornerRadius
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
    graphics.lineStyle(
        4,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        rink.left + 4,
        rink.centerY,
        rink.right - 4,
        rink.centerY
    );

    graphics.lineStyle(
        4,
        0x1d5fa7,
        1
    );

    graphics.lineBetween(
        rink.left + 4,
        rink.centerY - 150,
        rink.right - 4,
        rink.centerY - 150
    );

    graphics.lineBetween(
        rink.left + 4,
        rink.centerY + 150,
        rink.right - 4,
        rink.centerY + 150
    );
}

function drawCenterIce(
    graphics,
    rink
) {
    graphics.lineStyle(
        3,
        0x58c7ff,
        1
    );

    graphics.strokeCircle(
        rink.centerX,
        rink.centerY,
        42
    );

    graphics.fillStyle(
        0x58c7ff,
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

    graphics.fillStyle(
        0xff3b30,
        1
    );

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

    graphics.fillStyle(
        0xff3b30,
        1
    );

    graphics.fillCircle(
        x,
        y,
        3
    );

    const outside = 5;
    const inside = 2;
    const gap = 5;

    const hashes = [
        [
            x - gap,
            y - radius - outside,
            x - gap,
            y - radius + inside
        ],

        [
            x + gap,
            y - radius - outside,
            x + gap,
            y - radius + inside
        ],

        [
            x - gap,
            y + radius - inside,
            x - gap,
            y + radius + outside
        ],

        [
            x + gap,
            y + radius - inside,
            x + gap,
            y + radius + outside
        ],

        [
            x - radius - outside,
            y - gap,
            x - radius + inside,
            y - gap
        ],

        [
            x - radius - outside,
            y + gap,
            x - radius + inside,
            y + gap
        ],

        [
            x + radius - inside,
            y - gap,
            x + radius + outside,
            y - gap
        ],

        [
            x + radius - inside,
            y + gap,
            x + radius + outside,
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

    const horizontal = 11;
    const vertical = 8;
    const length = 6;

    const corners = [
        [
            x - horizontal,
            y - vertical,
            1,
            1
        ],

        [
            x + horizontal,
            y - vertical,
            -1,
            1
        ],

        [
            x - horizontal,
            y + vertical,
            1,
            -1
        ],

        [
            x + horizontal,
            y + vertical,
            -1,
            -1
        ]
    ];

    for (
        const corner
        of corners
    ) {
        graphics.lineBetween(
            corner[0],
            corner[1],
            corner[0] +
                length *
                corner[2],
            corner[1]
        );

        graphics.lineBetween(
            corner[0],
            corner[1],
            corner[0],
            corner[1] +
                length *
                corner[3]
        );
    }
}

/* =========================================================
   GOALS AND CREASES
========================================================= */

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
        0x58c7ff,
        1
    );

    graphics.beginPath();

    if (
        side === "top"
    ) {
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
        0x58c7ff,
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

    state.player =
        scene.add.circle(
            rink.centerX,
            rink.centerY + 66,
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

    state.playerIndicator =
        scene.add.triangle(
            rink.centerX,
            rink.centerY + 44,
            0,
            8,
            8,
            8,
            4,
            0,
            0xffdf38,
            1
        )
            .setStrokeStyle(
                1,
                0x7a6200,
                1
            )
            .setDepth(24);
}

function updatePlayerIndicator(
    scene
) {
    const state =
        scene.gameState;

    if (
        !state.player ||
        !state.playerIndicator
    ) {
        return;
    }

    state.playerIndicator.setPosition(
        state.player.x,
        state.player.y - 21
    );
}

/* =========================================================
   TEAMMATES
========================================================= */

function createTeammates(scene) {
    const rink =
        scene.gameState.rink;

    createTeammate(
        scene,
        rink.centerX - 72,
        rink.centerY + 22,
        "LW",
        "left"
    );

    createTeammate(
        scene,
        rink.centerX + 72,
        rink.centerY + 22,
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

    const body =
        scene.add.circle(
            x,
            y,
            state.teammateRadius,
            0x2f9f45
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

    const label =
        scene.add.text(
            x,
            y - 18,
            name,
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "10px",

                fontStyle:
                    "bold",

                color:
                    "#0b2b18",

                backgroundColor:
                    "#ffffff",

                padding: {
                    left: 2,
                    right: 2
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(22);

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
                126
            ),

        acceleration:
            Phaser.Math.Between(
                315,
                390
            ),

        deceleration: 430,
        turnSpeed: 5.5,

        targetX: x,
        targetY: y,

        decisionTimer:
            Phaser.Math.FloatBetween(
                0.5,
                1
            ),

        possessionTime: 0,

        laneOffsetX:
            side === "left"
                ? -78
                : 78,

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

function updateTeammateVisuals(
    teammate
) {
    teammate.label.setPosition(
        teammate.body.x,
        teammate.body.y - 18
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

    if (
        state.playStopped ||
        state.goalPresentation.active
    ) {
        return;
    }

    for (
        const teammate
        of state.teammates
    ) {
        chooseTeammateTarget(
            state,
            teammate
        );

        moveTeammateTowardTarget(
            state,
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
    state,
    teammate
) {
    const owner =
        state.possession.owner;

    const rink =
        state.rink;

    if (
        owner === teammate
    ) {
        choosePuckCarrierTarget(
            state,
            teammate
        );

        return;
    }

    if (
        owner === state.player
    ) {
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

    const chaser =
        findLoosePuckChaser(
            state
        );

    if (
        chaser === teammate
    ) {
        const puckSpeed =
            Math.sqrt(
                state.puckVelocityX *
                    state.puckVelocityX +
                state.puckVelocityY *
                    state.puckVelocityY
            );

        const leadTime =
            Phaser.Math.Clamp(
                puckSpeed / 900,
                0.03,
                0.16
            );

        teammate.targetX =
            state.puck.x +
            state.puckVelocityX *
                leadTime;

        teammate.targetY =
            state.puck.y +
            state.puckVelocityY *
                leadTime;

        return;
    }

    const puckInOffensiveHalf =
        state.puck.y <
        rink.centerY;

    if (
        puckInOffensiveHalf
    ) {
        const puckOnLeft =
            state.puck.x <
            rink.centerX;

        const teammateOnFarSide =
            (
                puckOnLeft &&
                teammate.side === "right"
            ) ||
            (
                !puckOnLeft &&
                teammate.side === "left"
            );

        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -58
                    : 58
            );

        teammate.targetY =
            teammateOnFarSide
                ? state.offensiveGoal.y + 92
                : Phaser.Math.Clamp(
                    state.puck.y + 62,
                    state.offensiveGoal.y + 120,
                    rink.centerY - 12
                );

        return;
    }

    const playerNearPuck =
        Phaser.Math.Distance.Between(
            state.player.x,
            state.player.y,
            state.puck.x,
            state.puck.y
        ) <= 112;

    if (
        playerNearPuck
    ) {
        teammate.targetX =
            rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            Phaser.Math.Clamp(
                state.puck.y - 78,
                rink.centerY - 28,
                rink.bottom - 125
            );

        return;
    }

    const puckOnLeft =
        state.puck.x <
        rink.centerX;

    const teammateOnPuckSide =
        (
            puckOnLeft &&
            teammate.side === "left"
        ) ||
        (
            !puckOnLeft &&
            teammate.side === "right"
        );

    teammate.targetX =
        rink.centerX +
        (
            teammate.side === "left"
                ? -64
                : 64
        );

    teammate.targetY =
        teammateOnPuckSide
            ? Phaser.Math.Clamp(
                state.puck.y + 52,
                rink.centerY + 10,
                rink.bottom - 105
            )
            : Phaser.Math.Clamp(
                state.puck.y - 92,
                rink.centerY - 40,
                rink.bottom - 145
            );
}

function chooseSupportTargetForPlayer(
    state,
    teammate
) {
    const rink =
        state.rink;

    const player =
        state.player;

    if (
        player.y >=
        rink.centerY
    ) {
        teammate.targetX =
            rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            player.y - 82;

        return;
    }

    const playerOnLeft =
        player.x <
        rink.centerX;

    const teammateFarSide =
        (
            playerOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !playerOnLeft &&
            teammate.side === "left"
        );

    if (
        teammateFarSide
    ) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -48
                    : 48
            );

        teammate.targetY =
            state.offensiveGoal.y + 80;

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
    if (
        teammate === puckCarrier
    ) {
        return;
    }

    const rink =
        state.rink;

    const carrierOnLeft =
        puckCarrier.body.x <
        rink.centerX;

    const farSide =
        (
            carrierOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !carrierOnLeft &&
            teammate.side === "left"
        );

    if (
        farSide
    ) {
        teammate.targetX =
            rink.centerX +
            (
                teammate.side === "left"
                    ? -45
                    : 45
            );

        teammate.targetY =
            state.offensiveGoal.y + 75;
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
    const goal =
        state.offensiveGoal;

    const rink =
        state.rink;

    const distanceToGoal =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            goal.x,
            goal.y
        );

    if (
        distanceToGoal > 190
    ) {
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

    if (
        distanceToGoal > 105
    ) {
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
        teammate.cycleDirection * 18;

    teammate.targetY =
        goal.y + 64;
}

function findLoosePuckChaser(
    state
) {
    const playerDistance =
        Phaser.Math.Distance.Between(
            state.player.x,
            state.player.y,
            state.puck.x,
            state.puck.y
        );

    let closest = null;
    let closestDistance =
        Infinity;

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

            closest =
                teammate;
        }
    }

    /*
     * Give the controlled player first rights to a nearby loose puck.
     * A teammate only pressures when clearly closer or when the player
     * is too far away to reasonably get there.
     */
    if (
        playerDistance <= 108
    ) {
        return null;
    }

    if (
        playerDistance <=
        closestDistance + 42
    ) {
        return null;
    }

    return closest;
}

function moveTeammateTowardTarget(
    state,
    teammate,
    deltaSeconds
) {
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

    if (
        distance > 5
    ) {
        const directionX =
            deltaX / distance;

        const directionY =
            deltaY / distance;

        let speed =
            teammate.maximumSpeed;

        if (
            distance < 45
        ) {
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

    const changeRate =
        distance > 5
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

    if (
        corrected.hitX
    ) {
        teammate.velocityX = 0;
    }

    if (
        corrected.hitY
    ) {
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
    current
) {
    for (
        const other
        of state.teammates
    ) {
        if (
            other === current
        ) {
            continue;
        }

        const deltaX =
            current.body.x -
            other.body.x;

        const deltaY =
            current.body.y -
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
            distance >= minimumDistance ||
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

        current.body.x +=
            normalX *
            overlap *
            0.5;

        current.body.y +=
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
    let desiredX;
    let desiredY;

    if (
        state.possession.owner ===
        teammate
    ) {
        desiredX =
            state.offensiveGoal.x -
            teammate.body.x;

        desiredY =
            state.offensiveGoal.y -
            teammate.body.y;
    } else {
        const speed =
            Math.sqrt(
                teammate.velocityX *
                    teammate.velocityX +
                teammate.velocityY *
                    teammate.velocityY
            );

        if (
            speed > 4
        ) {
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

    if (
        desiredLength < 0.001
    ) {
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
        currentAngle +
        Phaser.Math.Clamp(
            difference,
            -maximumTurn,
            maximumTurn
        );

    teammate.facingX =
        Math.cos(newAngle);

    teammate.facingY =
        Math.sin(newAngle);
}

/* =========================================================
   STICK GEOMETRY
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

    return {
        perpendicularX,
        perpendicularY,

        bladeStartX,
        bladeStartY,

        bladeEndX,
        bladeEndY,

        puckAnchorX:
            bladeStartX +
            perpendicularX * 4.5,

        puckAnchorY:
            bladeStartY +
            perpendicularY * 4.5
    };
}

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
        perpendicularX,
        perpendicularY,

        bladeStartX,
        bladeStartY,

        bladeEndX,
        bladeEndY,

        puckAnchorX:
            bladeStartX +
            perpendicularX * 4,

        puckAnchorY:
            bladeStartY +
            perpendicularY * 4
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

/* =========================================================
   GOALIE
========================================================= */

function createGoalie(scene) {
    const state =
        scene.gameState;

    const goalie =
        state.goalie;

    /*
     * The goalie is deliberately boxier than a skater.
     * The large square is the equipment silhouette, while
     * the actual save area is slightly smaller so shots can
     * still beat the goalie along the posts.
     */
    goalie.body =
        scene.add.rectangle(
            goalie.x,
            goalie.y,
            goalie.visualWidth,
            goalie.visualHeight,
            0x8f2020,
            1
        )
            .setStrokeStyle(
                3,
                0xffffff,
                1
            )
            .setDepth(26);

    goalie.mask =
        scene.add.rectangle(
            goalie.x,
            goalie.y - 6,
            9,
            6,
            0xd8e5ef,
            1
        )
            .setStrokeStyle(
                1,
                0x17375e,
                1
            )
            .setDepth(27);

    goalie.pads =
        scene.add.rectangle(
            goalie.x,
            goalie.y + 6,
            17,
            6,
            0xffffff,
            1
        )
            .setStrokeStyle(
                1,
                0x17375e,
                1
            )
            .setDepth(27);

    goalie.glove =
        scene.add.circle(
            goalie.x - 11,
            goalie.y,
            4,
            0x8f2020,
            1
        )
            .setStrokeStyle(
                1,
                0xffffff,
                1
            )
            .setDepth(27);

    goalie.blocker =
        scene.add.rectangle(
            goalie.x + 11,
            goalie.y,
            6,
            7,
            0x8f2020,
            1
        )
            .setStrokeStyle(
                1,
                0xffffff,
                1
            )
            .setDepth(27);

    goalie.stick =
        scene.add.graphics()
            .setDepth(27);

    goalie.label =
        scene.add.text(
            goalie.x,
            goalie.y - 22,
            "G",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "9px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                backgroundColor:
                    "#8f2020",

                padding: {
                    left: 3,
                    right: 3,
                    top: 1,
                    bottom: 1
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(28);

    goalie.saveFlash =
        scene.add.text(
            goalie.x,
            goalie.y + 27,
            "SAVE!",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "12px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                stroke:
                    "#17375e",

                strokeThickness:
                    3
            }
        )
            .setOrigin(0.5)
            .setDepth(180)
            .setVisible(false);

    updateGoalieVisuals(
        scene
    );
}

function updateGoalie(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    const goalie =
        state.goalie;

    if (
        !goalie.body ||
        state.playStopped
    ) {
        return;
    }

    goalie.saveCooldown =
        Math.max(
            0,
            goalie.saveCooldown -
                deltaSeconds
        );

    goalie.reactionTimer -=
        deltaSeconds;

    /*
     * The goalie does not read the player's input instantly.
     * It updates its guess several times per second, creating
     * reaction delay and making dekes and quick shots useful.
     */
    if (
        goalie.reactionTimer <= 0
    ) {
        goalie.reactionTimer =
            goalie.reactionDelay +
            Phaser.Math.FloatBetween(
                -0.025,
                0.045
            );

        let desiredTargetX =
            goalie.homeX;

        const puckIsLoose =
            !state.possession.owner;

        const puckIsAttacking =
            state.puck.y <
            state.rink.centerY + 45;

        if (
            puckIsLoose &&
            puckIsAttacking &&
            state.puckVelocityY < -12
        ) {
            const goalieLineY =
                goalie.y +
                goalie.saveHalfHeight;

            const secondsToGoalie =
                (
                    goalieLineY -
                    state.puck.y
                ) /
                state.puckVelocityY;

            if (
                secondsToGoalie > 0 &&
                secondsToGoalie < 1.6
            ) {
                desiredTargetX =
                    state.puck.x +
                    state.puckVelocityX *
                    secondsToGoalie;
            } else {
                desiredTargetX =
                    state.puck.x;
            }
        } else if (
            state.possession.owner
        ) {
            const owner =
                state.possession.owner;

            desiredTargetX =
                owner === state.player
                    ? state.player.x
                    : owner.body.x;
        }

        /* Small tracking mistakes stop the goalie being robotic. */
        goalie.trackingError =
            Phaser.Math.FloatBetween(
                -10,
                10
            );

        goalie.trackedTargetX =
            Phaser.Math.Clamp(
                desiredTargetX +
                    goalie.trackingError,
                state.rink.centerX - 19,
                state.rink.centerX + 19
            );
    }

    const difference =
        goalie.trackedTargetX -
        goalie.x;

    let desiredVelocity = 0;

    if (
        Math.abs(difference) > 1.5
    ) {
        desiredVelocity =
            Math.sign(difference) *
            goalie.maximumSpeed;

        if (
            Math.abs(difference) < 13
        ) {
            desiredVelocity *=
                Phaser.Math.Clamp(
                    Math.abs(difference) / 13,
                    0.25,
                    1
                );
        }
    }

    const changeRate =
        desiredVelocity === 0
            ? goalie.deceleration
            : goalie.acceleration;

    goalie.velocityX =
        moveToward(
            goalie.velocityX,
            desiredVelocity,
            changeRate *
                deltaSeconds
        );

    goalie.x +=
        goalie.velocityX *
        deltaSeconds;

    goalie.x =
        Phaser.Math.Clamp(
            goalie.x,
            state.rink.centerX - 17,
            state.rink.centerX + 17
        );

    goalie.y =
        goalie.homeY;

    updateGoalieVisuals(
        scene
    );
}

function updateGoalieVisuals(scene) {
    const goalie =
        scene.gameState.goalie;

    if (!goalie.body) {
        return;
    }

    goalie.body.setPosition(
        goalie.x,
        goalie.y
    );

    goalie.mask.setPosition(
        goalie.x,
        goalie.y - 7
    );

    goalie.pads.setPosition(
        goalie.x,
        goalie.y + 8
    );

    goalie.glove.setPosition(
        goalie.x - 11,
        goalie.y
    );

    goalie.blocker.setPosition(
        goalie.x + 11,
        goalie.y
    );

    goalie.label.setPosition(
        goalie.x,
        goalie.y - 22
    );

    goalie.saveFlash.setPosition(
        goalie.x,
        goalie.y + 27
    );

    goalie.stick.clear();

    goalie.stick.lineStyle(
        3,
        0x6e4524,
        1
    );

    goalie.stick.lineBetween(
        goalie.x + 9,
        goalie.y + 2,
        goalie.x + 14,
        goalie.y + 14
    );

    goalie.stick.lineStyle(
        4,
        0x222222,
        1
    );

    goalie.stick.lineBetween(
        goalie.x + 14,
        goalie.y + 14,
        goalie.x + 6,
        goalie.y + 16
    );
}

function handleGoalieSave(
    scene,
    previousX,
    previousY
) {
    const state =
        scene.gameState;

    const goalie =
        state.goalie;

    if (
        !goalie.body ||
        goalie.saveCooldown > 0 ||
        state.possession.owner ||
        state.playStopped
    ) {
        return false;
    }

    const puck =
        state.puck;

    /*
     * Only stop pucks travelling toward the top goal.
     */
    if (
        state.puckVelocityY >= -8
    ) {
        return false;
    }

    const collisionHalfWidth =
        goalie.saveHalfWidth +
        state.puckRadius;

    const collisionHalfHeight =
        goalie.saveHalfHeight +
        state.puckRadius;

    const goalieTop =
        goalie.y -
        collisionHalfHeight;

    const goalieBottom =
        goalie.y +
        collisionHalfHeight;

    /*
     * Find where the puck crossed the goalie's horizontal save line.
     * This prevents fast shots from tunnelling through the goalie.
     */
    const crossedSaveArea =
        previousY >= goalieTop &&
        puck.y <= goalieBottom;

    if (
        !crossedSaveArea
    ) {
        return false;
    }

    const crossingX =
        getLineCrossingX(
            previousX,
            previousY,
            puck.x,
            puck.y,
            goalie.y
        );

    const horizontalOffset =
        crossingX -
        goalie.x;

    if (
        Math.abs(
            horizontalOffset
        ) > collisionHalfWidth
    ) {
        return false;
    }

    /*
     * A puck that physically reaches the goalie is always saved.
     * Goals remain possible by shooting around the smaller save area,
     * especially toward either post. The puck no longer ghosts through
     * the goalie's body because of a random failed-save roll.
     */
    const offset =
        Phaser.Math.Clamp(
            horizontalOffset /
            collisionHalfWidth,
            -1,
            1
        );

    const incomingSpeed =
        Math.sqrt(
            state.puckVelocityX *
                state.puckVelocityX +
            state.puckVelocityY *
                state.puckVelocityY
        );

    puck.setPosition(
        goalie.x +
            offset *
            collisionHalfWidth,
        goalieBottom + 0.85
    );

    state.puckVelocityX =
        state.puckVelocityX * 0.22 +
        offset *
            Math.max(
                72,
                incomingSpeed * 0.48
            ) +
        goalie.velocityX * 0.2;

    state.puckVelocityY =
        Math.max(
            112,
            incomingSpeed * 0.5
        );

    goalie.saveCooldown =
        0.13;

    showGoalieSaveFlash(
        scene
    );

    return true;
}

function showGoalieSaveFlash(scene) {
    const goalie =
        scene.gameState.goalie;

    if (!goalie.saveFlash) {
        return;
    }

    scene.tweens.killTweensOf(
        goalie.saveFlash
    );

    goalie.saveFlash
        .setVisible(true)
        .setAlpha(1)
        .setScale(0.75);

    scene.tweens.add({
        targets:
            goalie.saveFlash,

        alpha: 0,
        scaleX: 1.25,
        scaleY: 1.25,

        duration: 430,

        ease:
            "Cubic.Out",

        onComplete: () => {
            goalie.saveFlash
                .setVisible(false)
                .setAlpha(1)
                .setScale(1);
        }
    });
}

function resetGoalie(scene) {
    const state =
        scene.gameState;

    const goalie =
        state.goalie;

    goalie.x =
        goalie.homeX;

    goalie.y =
        goalie.homeY;

    goalie.velocityX = 0;
    goalie.saveCooldown = 0;
    goalie.reactionTimer = 0;
    goalie.trackedTargetX =
        goalie.homeX;
    goalie.trackingError = 0;

    if (goalie.saveFlash) {
        scene.tweens.killTweensOf(
            goalie.saveFlash
        );

        goalie.saveFlash
            .setVisible(false)
            .setAlpha(1)
            .setScale(1);
    }

    updateGoalieVisuals(
        scene
    );
}

/* =========================================================
   PUCK
========================================================= */

function createPuck(scene) {
    const state =
        scene.gameState;

    state.puck =
        scene.add.circle(
            state.rink.centerX,
            state.rink.centerY,
            state.puckRadius,
            0x111111
        )
            .setStrokeStyle(
                1,
                0x555555,
                1
            )
            .setDepth(23);
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

    if (
        state.playStopped ||
        !possession.owner
    ) {
        return;
    }

    hardLockPossessedPuck(
        scene
    );

    if (
        possession.owner !==
        state.player
    ) {
        updateAIPuckDecision(
            scene,
            possession.owner,
            deltaSeconds
        );
    }
}

function hardLockPossessedPuck(scene) {
    const state =
        scene.gameState;

    const owner =
        state.possession.owner;

    if (
        !owner ||
        state.playStopped
    ) {
        return;
    }

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    if (
        owner === state.player
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

function givePuckToPlayer(scene) {
    const state =
        scene.gameState;

    if (
        state.playStopped
    ) {
        return;
    }

    state.possession.owner =
        state.player;

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.passCall.active = false;
    state.passCall.displayTimer = 0;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    hardLockPossessedPuck(
        scene
    );
}

function givePuckToTeammate(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    if (
        state.playStopped
    ) {
        return;
    }

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
            1.05
        );

    hardLockPossessedPuck(
        scene
    );
}

function releasePossession(
    state,
    cooldown = 0.18
) {
    state.possession.owner = null;

    state.possession.pickupCooldown =
        cooldown;
}

function checkForPuckPickup(scene) {
    const state =
        scene.gameState;

    const possession =
        state.possession;

    if (
        state.playStopped ||
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

        if (
            distance <= 24
        ) {
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

        if (
            distance <= 24
        ) {
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

        target:
            state.player,

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

            target:
                teammate,

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
        givePuckToPlayer(
            scene
        );
    } else {
        givePuckToTeammate(
            scene,
            closest.target
        );
    }
}

/* =========================================================
   CONTEXTUAL PASS / CALL-PASS BUTTON
========================================================= */

function createContextualActionButton(
    scene,
    x,
    y
) {
    const state =
        scene.gameState;

    const actionButton =
        state.actionButton;

    actionButton.button =
        scene.add.rectangle(
            x,
            y,
            104,
            36,
            0x2477c9,
            0.98
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

    actionButton.label =
        scene.add.text(
            x,
            y,
            "PASS",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "11px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                align:
                    "center"
            }
        )
            .setOrigin(0.5)
            .setDepth(111)
            .setInteractive({
                useHandCursor: true
            });

    const useButton = (
        pointer,
        localX,
        localY,
        event
    ) => {
        useContextualActionButton(
            scene
        );

        if (
            event &&
            event.stopPropagation
        ) {
            event.stopPropagation();
        }
    };

    actionButton.button.on(
        "pointerdown",
        useButton
    );

    actionButton.label.on(
        "pointerdown",
        useButton
    );
}

function useContextualActionButton(scene) {
    const state =
        scene.gameState;

    if (
        state.playStopped ||
        state.goalPresentation.active ||
        state.actionButton.cooldown > 0
    ) {
        return;
    }

    const owner =
        state.possession.owner;

    if (
        owner === state.player
    ) {
        requestPlayerPass(
            scene
        );

        return;
    }

    if (
        owner &&
        owner !== state.player
    ) {
        requestPassFromTeammate(
            scene
        );

        return;
    }

    flashActionButton(
        scene,
        "NO PUCK",
        0x8f2020
    );

    state.actionButton.cooldown =
        0.35;
}

function requestPlayerPass(scene) {
    const state =
        scene.gameState;

    const teammate =
        findBestPlayerPassTarget(
            state
        );

    if (!teammate) {
        flashActionButton(
            scene,
            "NO TARGET",
            0x8f2020
        );

        state.actionButton.cooldown =
            0.35;

        return;
    }

    passPuckToTeammate(
        scene,
        teammate
    );

    state.actionButton.cooldown =
        state.actionButton
            .cooldownLength;
}

function findBestPlayerPassTarget(
    state
) {
    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    let best = null;
    let bestScore =
        -Infinity;

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

        if (
            distance < 35 ||
            distance > 280
        ) {
            continue;
        }

        const directionX =
            deltaX / distance;

        const directionY =
            deltaY / distance;

        const facingDot =
            state.facingX *
                directionX +
            state.facingY *
                directionY;

        let score =
            facingDot * 3;

        score +=
            (
                state.player.y -
                teammate.body.y
            ) * 0.025;

        score +=
            Math.min(
                distance / 150,
                1
            ) * 0.25;

        if (
            state.aim.active &&
            state.aim.strength > 0.08
        ) {
            const aimDot =
                state.aim.directionX *
                    directionX +
                state.aim.directionY *
                    directionY;

            score +=
                aimDot * 2;
        }

        if (
            score > bestScore
        ) {
            bestScore = score;
            best = teammate;
        }
    }

    return best;
}

function passPuckToTeammate(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        state.player
    ) {
        return;
    }

    recordPlayerPass(
        scene
    );

    const start =
        getPlayerStickGeometry(
            state
        );

    const target =
        getTeammateStickGeometry(
            teammate
        );

    const leadX =
        target.puckAnchorX +
        teammate.velocityX * 0.1;

    const leadY =
        target.puckAnchorY +
        teammate.velocityY * 0.1;

    let directionX =
        leadX -
        start.puckAnchorX;

    let directionY =
        leadY -
        start.puckAnchorY;

    const distance =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (
        distance < 0.001
    ) {
        return;
    }

    directionX /=
        distance;

    directionY /=
        distance;

    const passSpeed =
        Phaser.Math.Clamp(
            235 +
            distance * 0.55,
            255,
            390
        );

    releasePossession(
        state,
        0.18
    );

    state.possession.passTarget =
        teammate;

    state.possession.passTargetType =
        "teammate";

    state.puck.setPosition(
        start.puckAnchorX,
        start.puckAnchorY
    );

    state.puckVelocityX =
        directionX * passSpeed;

    state.puckVelocityY =
        directionY * passSpeed;

    flashActionButton(
        scene,
        `PASS ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ ${teammate.name}`,
        0x2477c9
    );
}

function requestPassFromTeammate(
    scene
) {
    const state =
        scene.gameState;

    const carrier =
        state.possession.owner;

    if (
        !carrier ||
        carrier === state.player
    ) {
        return;
    }

    state.passCall.active = true;
    state.passCall.displayTimer = 0.9;

    state.actionButton.cooldown =
        state.actionButton
            .cooldownLength;

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const carrierGeometry =
        getTeammateStickGeometry(
            carrier
        );

    const distance =
        Phaser.Math.Distance.Between(
            playerGeometry.puckAnchorX,
            playerGeometry.puckAnchorY,
            carrierGeometry.puckAnchorX,
            carrierGeometry.puckAnchorY
        );

    const goalDistance =
        Phaser.Math.Distance.Between(
            carrier.body.x,
            carrier.body.y,
            state.offensiveGoal.x,
            state.offensiveGoal.y
        );

    let chance = 0.78;

    if (
        state.player.y <
        carrier.body.y
    ) {
        chance += 0.1;
    }

    if (
        distance < 180
    ) {
        chance += 0.08;
    }

    if (
        distance > 240
    ) {
        chance -= 0.2;
    }

    if (
        goalDistance < 85
    ) {
        chance -= 0.45;
    } else if (
        goalDistance < 120
    ) {
        chance -= 0.23;
    }

    chance =
        Phaser.Math.Clamp(
            chance,
            0.15,
            0.95
        );

    if (
        distance >= 38 &&
        distance <= 280 &&
        Math.random() < chance
    ) {
        passFromTeammate(
            scene,
            carrier,
            {
                type: "player",
                target: state.player
            }
        );

        flashActionButton(
            scene,
            "PASS COMING",
            0x2477c9
        );

        return;
    }

    carrier.decisionTimer =
        Math.min(
            carrier.decisionTimer,
            0.1
        );

    flashActionButton(
        scene,
        "IGNORED",
        0x8f6b20
    );
}

function updateActionButtonState(
    scene,
    deltaSeconds
) {
    const actionButton =
        scene.gameState
            .actionButton;

    actionButton.cooldown =
        Math.max(
            0,
            actionButton.cooldown -
                deltaSeconds
        );
}

function updateContextualActionButton(
    scene
) {
    const state =
        scene.gameState;

    const actionButton =
        state.actionButton;

    if (
        !actionButton.button ||
        !actionButton.label
    ) {
        return;
    }

    if (
        state.playStopped ||
        state.goalPresentation.active
    ) {
        actionButton.button
            .setFillStyle(
                0x596a7b,
                0.65
            );

        actionButton.label
            .setText("WAIT")
            .setAlpha(0.7);

        return;
    }

    if (
        actionButton.cooldown > 0
    ) {
        actionButton.button
            .setFillStyle(
                0x596a7b,
                0.8
            );

        actionButton.label
            .setText("WAIT")
            .setAlpha(0.8);

        return;
    }

    const owner =
        state.possession.owner;

    if (
        owner === state.player
    ) {
        actionButton.button
            .setFillStyle(
                0x2477c9,
                0.98
            );

        actionButton.label
            .setText("PASS")
            .setAlpha(1);

        return;
    }

    if (
        owner &&
        owner !== state.player
    ) {
        actionButton.button
            .setFillStyle(
                0x2477c9,
                0.98
            );

        actionButton.label
            .setText("CALL PASS")
            .setAlpha(1);

        return;
    }

    actionButton.button
        .setFillStyle(
            0x596a7b,
            0.7
        );

    actionButton.label
        .setText("NO PUCK")
        .setAlpha(0.75);
}

function flashActionButton(
    scene,
    text,
    color
) {
    const actionButton =
        scene.gameState
            .actionButton;

    if (
        !actionButton.button ||
        !actionButton.label
    ) {
        return;
    }

    if (
        actionButton.flashTimer
    ) {
        actionButton.flashTimer.remove(
            false
        );
    }

    actionButton.button
        .setFillStyle(
            color,
            1
        );

    actionButton.label
        .setText(text)
        .setAlpha(1);

    actionButton.flashTimer =
        scene.time.delayedCall(
            450,
            () => {
                actionButton.flashTimer =
                    null;

                updateContextualActionButton(
                    scene
                );
            }
        );
}

/* =========================================================
   PASS-CALL VISUALS
========================================================= */

function createPassCallVisuals(scene) {
    const state =
        scene.gameState;

    state.passCall.ring =
        scene.add.graphics()
            .setDepth(25);

    state.passCall.text =
        scene.add.text(
            state.player.x,
            state.player.y - 35,
            "PASS!",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "12px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                backgroundColor:
                    "#1769d2",

                padding: {
                    left: 6,
                    right: 6,
                    top: 3,
                    bottom: 3
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(26)
            .setVisible(false);
}

function updatePassCallState(
    scene,
    deltaSeconds
) {
    const passCall =
        scene.gameState
            .passCall;

    passCall.displayTimer =
        Math.max(
            0,
            passCall.displayTimer -
                deltaSeconds
        );

    if (
        passCall.displayTimer <= 0
    ) {
        passCall.active = false;
    }
}

function updatePassCallVisuals(scene) {
    const state =
        scene.gameState;

    const passCall =
        state.passCall;

    if (
        passCall.ring
    ) {
        passCall.ring.clear();
    }

    if (
        passCall.text
    ) {
        passCall.text.setVisible(
            false
        );
    }

    if (
        !passCall.active ||
        state.playStopped
    ) {
        return;
    }

    const pulse =
        1 +
        Math.sin(
            scene.time.now * 0.018
        ) *
        0.18;

    passCall.ring.lineStyle(
        3,
        0x28e7ff,
        0.95
    );

    passCall.ring.strokeCircle(
        state.player.x,
        state.player.y,
        18 * pulse
    );

    passCall.text
        .setPosition(
            state.player.x,
            state.player.y - 35
        )
        .setVisible(true);
}

/* =========================================================
   AI SHOOTING AND PASSING
========================================================= */

function updateAIPuckDecision(
    scene,
    teammate,
    deltaSeconds
) {
    const state =
        scene.gameState;

    if (
        state.playStopped
    ) {
        return;
    }

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

    if (
        distanceToGoal < 85
    ) {
        shotChance = 0.82;
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
        teammate.possessionTime > 2.4
    ) {
        shotChance += 0.18;
    }

    if (
        state.passCall.active &&
        distanceToGoal >= 90
    ) {
        shotChance *= 0.55;
    }

    if (
        Math.random() < shotChance
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

    let passChance = 0.43;

    if (
        state.passCall.active &&
        passTarget &&
        passTarget.type === "player"
    ) {
        passChance = 0.88;
    }

    const forceDecision =
        teammate.possessionTime >
        2.9;

    if (
        passTarget &&
        (
            Math.random() <
                passChance ||
            forceDecision
        )
    ) {
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

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    candidates.push({
        type: "player",

        target:
            state.player,

        x:
            playerGeometry.puckAnchorX,

        y:
            playerGeometry.puckAnchorY
    });

    for (
        const other
        of state.teammates
    ) {
        if (
            other === teammate
        ) {
            continue;
        }

        const geometry =
            getTeammateStickGeometry(
                other
            );

        candidates.push({
            type: "teammate",

            target:
                other,

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
            distance > 270
        ) {
            continue;
        }

        const forwardProgress =
            teammate.body.y -
            candidate.y;

        let score =
            forwardProgress * 0.015 +
            Math.min(
                distance / 130,
                1
            );

        score +=
            Math.random() *
            (
                candidate.type ===
                    "player"
                    ? 0.65
                    : 0.8
            );

        if (
            candidate.y <
            teammate.body.y
        ) {
            score += 0.35;
        }

        if (
            state.passCall.active &&
            candidate.type ===
                "player"
        ) {
            score += 2.25;
        }

        if (
            score > bestScore
        ) {
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
        state.playStopped ||
        state.possession.owner !==
            teammate
    ) {
        return;
    }

    state.playerStats.lastShooter =
        teammate;

    const geometry =
        getTeammateStickGeometry(
            teammate
        );

    const targetX =
        state.offensiveGoal.x +
        Phaser.Math.Between(
            -10,
            10
        );

    const targetY =
        state.offensiveGoal.y - 12;

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

    if (
        distance < 0.001
    ) {
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

    state.passCall.active = false;

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

    state.puckVelocityX =
        directionX *
        shotSpeed +
        teammate.velocityX * 0.07;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        teammate.velocityY * 0.07;

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
        state.playStopped ||
        state.possession.owner !==
            teammate
    ) {
        return;
    }

    if (
        state.playerStats.lastPasser !==
        "player"
    ) {
        state.playerStats.lastPasser =
            teammate;
    }

    const start =
        getTeammateStickGeometry(
            teammate
        );

    let targetX;
    let targetY;

    if (
        passTarget.type ===
        "player"
    ) {
        const target =
            getPlayerStickGeometry(
                state
            );

        targetX =
            target.puckAnchorX +
            state.playerVelocityX *
                0.12;

        targetY =
            target.puckAnchorY +
            state.playerVelocityY *
                0.12;
    } else {
        const target =
            getTeammateStickGeometry(
                passTarget.target
            );

        targetX =
            target.puckAnchorX +
            passTarget.target
                .velocityX * 0.1;

        targetY =
            target.puckAnchorY +
            passTarget.target
                .velocityY * 0.1;
    }

    let directionX =
        targetX -
        start.puckAnchorX;

    let directionY =
        targetY -
        start.puckAnchorY;

    const distance =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (
        distance < 0.001
    ) {
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
            390
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
        start.puckAnchorX,
        start.puckAnchorY
    );

    state.puckVelocityX =
        directionX * passSpeed;

    state.puckVelocityY =
        directionY * passSpeed;

    teammate.possessionTime = 0;

    if (
        passTarget.type ===
        "player"
    ) {
        state.passCall.active = false;
    }
}

/* =========================================================
   PLAYER SHOOTING
========================================================= */

function shootPuckInDirection(
    scene,
    directionX,
    directionY,
    shotSpeed
) {
    const state =
        scene.gameState;

    if (
        state.playStopped ||
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
        directionLength < 0.001
    ) {
        return;
    }

    directionX /=
        directionLength;

    directionY /=
        directionLength;

    recordPlayerShot(
        scene
    );

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
        state.playerVelocityX * 0.08;

    state.puckVelocityY =
        directionY *
        shotSpeed +
        state.playerVelocityY * 0.08;
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

    const turnMultiplier =
        state.sprinting
            ? 0.8
            : 1;

    const maximumTurn =
        state.turnSpeed *
        turnMultiplier *
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

    const corrected =
        clampPointInsideRoundedRink(
            state.player.x +
                state.playerVelocityX *
                deltaSeconds,

            state.player.y +
                state.playerVelocityY *
                deltaSeconds,

            state.playerRadius,
            state.rink
        );

    state.player.setPosition(
        corrected.x,
        corrected.y
    );

    if (
        corrected.hitX
    ) {
        state.playerVelocityX = 0;
    }

    if (
        corrected.hitY
    ) {
        state.playerVelocityY = 0;
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

    if (
        state.playStopped
    ) {
        return;
    }

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
                travelDistance / 0.5
            )
        );

    for (
        let step = 0;
        step < steps;
        step += 1
    ) {
        const previousX =
            puck.x;

        const previousY =
            puck.y;

        const nextX =
            puck.x +
            state.puckVelocityX *
                deltaSeconds /
                steps;

        const nextY =
            puck.y +
            state.puckVelocityY *
                deltaSeconds /
                steps;

        puck.setPosition(
            nextX,
            nextY
        );

        if (
            handleGoalieSave(
                scene,
                previousX,
                previousY
            )
        ) {
            continue;
        }

        if (
            checkForGoal(
                scene,
                previousX,
                previousY,
                nextX,
                nextY
            )
        ) {
            return;
        }

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

        if (
            corrected.hitX
        ) {
            state.puckVelocityX *=
                -0.55;
        }

        if (
            corrected.hitY
        ) {
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
            state.possession.owner ||
            state.playStopped
        ) {
            if (
                state.possession.owner
            ) {
                hardLockPossessedPuck(
                    scene
                );
            }

            return;
        }
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
   MOBILE CONTROLS
========================================================= */

function createMobileControls(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    const controlsY =
        Math.min(
            rink.bottom - 88,
            scene.scale.height - 145
        );

    createMovementJoystick(
        scene,
        rink.left + 64,
        controlsY
    );

    createAimJoystick(
        scene,
        rink.right - 64,
        controlsY
    );

    createContextualActionButton(
        scene,
        rink.left + 58,
        controlsY - 78
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
        scene.gameState
            .movement;

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
            if (
                scene.gameState
                    .playStopped ||
                movement.active
            ) {
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
            "SHOOT",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "9px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                align:
                    "center"
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
            if (
                scene.gameState
                    .playStopped ||
                aim.active
            ) {
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

function createSprintButton(
    scene,
    x,
    y
) {
    const state =
        scene.gameState;

    state.sprintButton.button =
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

    state.sprintButton.label =
        scene.add.text(
            x,
            y,
            "SPRINT OFF",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "11px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff"
            }
        )
            .setOrigin(0.5)
            .setDepth(111)
            .setInteractive({
                useHandCursor: true
            });

    const toggleSprint = (
        pointer,
        localX,
        localY,
        event
    ) => {
        if (
            state.playStopped
        ) {
            return;
        }

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

    state.sprintButton.button.on(
        "pointerdown",
        toggleSprint
    );

    state.sprintButton.label.on(
        "pointerdown",
        toggleSprint
    );
}

function updateSprintButtonAppearance(
    scene
) {
    const state =
        scene.gameState;

    if (
        !state.sprintButton.button ||
        !state.sprintButton.label
    ) {
        return;
    }

    if (
        state.sprinting
    ) {
        state.sprintButton.button
            .setFillStyle(
                0x35a85d,
                1
            )
            .setScale(1.04);

        state.sprintButton.label
            .setText(
                "SPRINT ON"
            )
            .setScale(1.04);
    } else {
        state.sprintButton.button
            .setFillStyle(
                0x1769d2,
                0.94
            )
            .setScale(1);

        state.sprintButton.label
            .setText(
                "SPRINT OFF"
            )
            .setScale(1);
    }
}

/* =========================================================
   JOYSTICK INPUT
========================================================= */

function updateMovementPointer(
    scene,
    pointer
) {
    const state =
        scene.gameState;

    const movement =
        state.movement;

    if (
        state.playStopped ||
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
        scene.gameState
            .movement;

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

    if (
        distance < 4
    ) {
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
        scene.gameState
            .movement;

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
        scene.gameState
            .movement;

    movement.active = false;
    movement.pointerId = null;

    movement.directionX = 0;
    movement.directionY = 0;
    movement.strength = 0;

    if (
        movement.knob
    ) {
        movement.knob.setPosition(
            movement.centerX,
            movement.centerY
        );
    }

    if (
        movement.base
    ) {
        movement.base.setFillStyle(
            0x17375e,
            0.72
        );
    }
}

function updateAimPointer(
    scene,
    pointer
) {
    const state =
        scene.gameState;

    const aim =
        state.aim;

    if (
        state.playStopped ||
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

    if (
        distance < 4
    ) {
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
    const state =
        scene.gameState;

    const aim =
        state.aim;

    if (
        !aim.active ||
        aim.pointerId !==
            pointer.id
    ) {
        return;
    }

    /*
     * The right joystick always shoots.
     * It never triggers a pass.
     */
    if (
        !state.playStopped &&
        shouldShoot &&
        aim.strength > 0.08
    ) {
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

    resetAimJoystick(
        scene
    );
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

    if (
        aim.knob
    ) {
        aim.knob.setPosition(
            aim.centerX,
            aim.centerY
        );
    }

    if (
        aim.label
    ) {
        aim.label.setPosition(
            aim.centerX,
            aim.centerY
        );
    }

    if (
        aim.base
    ) {
        aim.base.setFillStyle(
            0x8f2020,
            0.74
        );
    }

    if (
        aim.guide
    ) {
        aim.guide.clear();
    }

    if (
        aim.powerBar
    ) {
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

    resetMovementJoystick(
        scene
    );

    resetAimJoystick(
        scene
    );
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

    if (
        !aim.active ||
        state.playStopped
    ) {
        return;
    }

    const geometry =
        getPlayerStickGeometry(
            state
        );

    const hasPuck =
        state.possession.owner ===
        state.player;

    const guideColor =
        hasPuck
            ? 0xffd21f
            : 0xff3b30;

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

function updateTeammateIndicators(
    scene
) {
    const state =
        scene.gameState;

    const passTarget =
        state.possession.owner ===
        state.player
            ? findBestPlayerPassTarget(
                state
            )
            : null;

    for (
        const teammate
        of state.teammates
    ) {
        teammate.targetRing.clear();

        if (
            teammate === passTarget &&
            !state.playStopped
        ) {
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

                    shoot:
                        Phaser.Input.Keyboard
                            .KeyCodes.SPACE,

                    pass:
                        Phaser.Input.Keyboard
                            .KeyCodes.C,

                    sprint:
                        Phaser.Input.Keyboard
                            .KeyCodes.SHIFT
                });
    } catch (error) {
        console.warn(
            "Keyboard unavailable:",
            error
        );

        state.keyboard = null;
    }
}

function updateKeyboardInput(scene) {
    const state =
        scene.gameState;

    if (
        state.playStopped ||
        !state.keyboard
    ) {
        return;
    }

    const keyboard =
        state.keyboard;

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

        if (
            !state.aim.active
        ) {
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

    state.sprinting =
        keyboard.sprint.isDown;

    updateSprintButtonAppearance(
        scene
    );

    if (
        Phaser.Input.Keyboard
            .JustDown(
                keyboard.shoot
            )
    ) {
        shootPuckInDirection(
            scene,
            state.facingX,
            state.facingY,
            360
        );
    }

    if (
        Phaser.Input.Keyboard
            .JustDown(
                keyboard.pass
            )
    ) {
        useContextualActionButton(
            scene
        );
    }
}

/* =========================================================
   GOAL PRESENTATION
========================================================= */

function createGoalPresentation(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    const presentation =
        state.goalPresentation;

    const topGoalLineY =
        rink.top + 44;

    const bottomGoalLineY =
        rink.bottom - 44;

    presentation.topGlow =
        scene.add.circle(
            rink.centerX,
            topGoalLineY - 34,
            22,
            0xff0000,
            0
        )
            .setDepth(12);

    presentation.topLight =
        scene.add.circle(
            rink.centerX,
            topGoalLineY - 34,
            7,
            0x5a0000,
            0.92
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(13);

    presentation.bottomGlow =
        scene.add.circle(
            rink.centerX,
            bottomGoalLineY + 34,
            22,
            0xff0000,
            0
        )
            .setDepth(12);

    presentation.bottomLight =
        scene.add.circle(
            rink.centerX,
            bottomGoalLineY + 34,
            7,
            0x5a0000,
            0.92
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(13);

    presentation.banner =
        scene.add.text(
            rink.centerX,
            rink.centerY - 34,
            "GOAL!",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "46px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                stroke:
                    "#a90000",

                strokeThickness:
                    7
            }
        )
            .setOrigin(0.5)
            .setDepth(200)
            .setVisible(false);

    presentation.subtext =
        scene.add.text(
            rink.centerX,
            rink.centerY + 16,
            "Center-ice restart",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "14px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                backgroundColor:
                    "#8f1515",

                padding: {
                    left: 10,
                    right: 10,
                    top: 5,
                    bottom: 5
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(200)
            .setVisible(false);

    presentation.countdownText =
        scene.add.text(
            rink.centerX,
            rink.centerY + 56,
            "3",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "28px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                stroke:
                    "#17375e",

                strokeThickness:
                    5
            }
        )
            .setOrigin(0.5)
            .setDepth(201)
            .setVisible(false);
}

function checkForGoal(
    scene,
    previousX,
    previousY,
    currentX,
    currentY
) {
    const state =
        scene.gameState;

    if (
        state.goalPresentation.active ||
        state.playStopped ||
        state.possession.owner
    ) {
        return false;
    }

    const geometry =
        getGoalGeometry(
            state
        );

    const crossedTop =
        previousY >
            geometry.topLineY &&
        currentY <=
            geometry.topLineY;

    if (
        crossedTop
    ) {
        const crossingX =
            getLineCrossingX(
                previousX,
                previousY,
                currentX,
                currentY,
                geometry.topLineY
            );

        if (
            isCrossingInsideGoalMouth(
                state,
                crossingX
            )
        ) {
            registerGoal(
                scene,
                "top"
            );

            return true;
        }
    }

    const crossedBottom =
        previousY <
            geometry.bottomLineY &&
        currentY >=
            geometry.bottomLineY;

    if (
        crossedBottom
    ) {
        const crossingX =
            getLineCrossingX(
                previousX,
                previousY,
                currentX,
                currentY,
                geometry.bottomLineY
            );

        if (
            isCrossingInsideGoalMouth(
                state,
                crossingX
            )
        ) {
            registerGoal(
                scene,
                "bottom"
            );

            return true;
        }
    }

    return false;
}

function registerGoal(
    scene,
    scoredSide
) {
    const state =
        scene.gameState;

    const presentation =
        state.goalPresentation;

    if (
        presentation.active ||
        state.playStopped
    ) {
        return;
    }

    state.playStopped = true;

    if (
        scoredSide === "top"
    ) {
        if (
            state.playerStats.lastShooter ===
            "player"
        ) {
            state.playerStats.goals += 1;
        } else if (
            state.playerStats.lastPasser ===
            "player"
        ) {
            state.playerStats.assists += 1;
        }

        updatePlayerStatsDisplay(
            scene
        );
    }

    state.playerStats.lastShooter = null;
    state.playerStats.lastPasser = null;

    presentation.active = true;
    presentation.scoredSide =
        scoredSide;

    state.possession.owner = null;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;
    state.possession.pickupCooldown = 999;

    state.passCall.active = false;
    state.passCall.displayTimer = 0;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    resetMovementJoystick(
        scene
    );

    resetAimJoystick(
        scene
    );

    state.sprinting = false;

    updateSprintButtonAppearance(
        scene
    );

    for (
        const teammate
        of state.teammates
    ) {
        teammate.velocityX = 0;
        teammate.velocityY = 0;
    }

    if (
        scoredSide === "top"
    ) {
        state.score.top += 1;
    } else {
        state.score.bottom += 1;
    }

    updateScoreboard(
        scene
    );

    showGoalPresentation(
        scene,
        scoredSide
    );

    if (
        presentation.resetTimer
    ) {
        presentation.resetTimer.remove(
            false
        );
    }

    presentation.resetTimer =
        scene.time.delayedCall(
            2200,
            () => {
                beginCenterRestart(
                    scene
                );
            }
        );
}

function showGoalPresentation(
    scene,
    scoredSide
) {
    const presentation =
        scene.gameState
            .goalPresentation;

    presentation.banner
        .setVisible(true)
        .setAlpha(0)
        .setScale(0.7);

    presentation.subtext
        .setText(
            "Center-ice restart"
        )
        .setVisible(true)
        .setAlpha(0);

    presentation.countdownText
        .setVisible(false);

    scene.tweens.add({
        targets:
            presentation.banner,

        alpha: 1,

        scaleX: 1.12,
        scaleY: 1.12,

        duration: 220,

        ease: "Back.Out",

        yoyo: true,
        hold: 650
    });

    scene.tweens.add({
        targets:
            presentation.subtext,

        alpha: 1,

        duration: 180
    });

    const light =
        scoredSide === "top"
            ? presentation.topLight
            : presentation.bottomLight;

    const glow =
        scoredSide === "top"
            ? presentation.topGlow
            : presentation.bottomGlow;

    light
        .setFillStyle(
            0xff1111,
            1
        )
        .setAlpha(1)
        .setScale(1);

    glow
        .setFillStyle(
            0xff0000,
            0.52
        )
        .setAlpha(1)
        .setScale(1);

    scene.tweens.add({
        targets: [
            light,
            glow
        ],

        alpha: {
            from: 1,
            to: 0.15
        },

        scaleX: {
            from: 1,
            to: 1.55
        },

        scaleY: {
            from: 1,
            to: 1.55
        },

        duration: 165,
        yoyo: true,
        repeat: 6
    });

    scene.cameras.main.flash(
        120,
        255,
        40,
        40,
        false
    );

    scene.cameras.main.shake(
        130,
        0.004
    );
}

function beginCenterRestart(scene) {
    const presentation =
        scene.gameState
            .goalPresentation;

    resetPlayersForCenterFaceoff(
        scene,
        true
    );

    presentation.banner
        .setVisible(false);

    presentation.subtext
        .setText("Get ready")
        .setVisible(true)
        .setAlpha(1);

    presentation.countdownText
        .setText("3")
        .setVisible(true)
        .setAlpha(1)
        .setScale(1);

    runRestartCountdown(
        scene,
        3
    );
}

function runRestartCountdown(
    scene,
    number
) {
    const state =
        scene.gameState;

    const presentation =
        state.goalPresentation;

    if (
        !presentation.active
    ) {
        return;
    }

    if (
        number <= 0
    ) {
        presentation.countdownText
            .setText("GO!")
            .setVisible(true)
            .setAlpha(1)
            .setScale(1.25);

        presentation.subtext
            .setText(
                "You start with the puck"
            );

        scene.tweens.add({
            targets:
                presentation.countdownText,

            alpha: 0,
            scaleX: 1.65,
            scaleY: 1.65,

            duration: 420,

            ease: "Cubic.Out"
        });

        scene.time.delayedCall(
            430,
            () => {
                finishGoalRestart(
                    scene
                );
            }
        );

        return;
    }

    presentation.countdownText
        .setText(
            String(number)
        )
        .setVisible(true)
        .setAlpha(1)
        .setScale(0.65);

    scene.tweens.add({
        targets:
            presentation.countdownText,

        alpha: 1,

        scaleX: 1.2,
        scaleY: 1.2,

        duration: 220,

        ease: "Back.Out",

        yoyo: true,

        onComplete: () => {
            scene.time.delayedCall(
                300,
                () => {
                    runRestartCountdown(
                        scene,
                        number - 1
                    );
                }
            );
        }
    });
}

function finishGoalRestart(scene) {
    const state =
        scene.gameState;

    const presentation =
        state.goalPresentation;

    scene.tweens.killTweensOf(
        presentation.topLight
    );

    scene.tweens.killTweensOf(
        presentation.bottomLight
    );

    scene.tweens.killTweensOf(
        presentation.topGlow
    );

    scene.tweens.killTweensOf(
        presentation.bottomGlow
    );

    scene.tweens.killTweensOf(
        presentation.banner
    );

    scene.tweens.killTweensOf(
        presentation.subtext
    );

    scene.tweens.killTweensOf(
        presentation.countdownText
    );

    presentation.topLight
        .setFillStyle(
            0x5a0000,
            0.92
        )
        .setAlpha(1)
        .setScale(1);

    presentation.bottomLight
        .setFillStyle(
            0x5a0000,
            0.92
        )
        .setAlpha(1)
        .setScale(1);

    presentation.topGlow
        .setAlpha(0)
        .setScale(1);

    presentation.bottomGlow
        .setAlpha(0)
        .setScale(1);

    presentation.banner
        .setVisible(false)
        .setAlpha(1)
        .setScale(1);

    presentation.subtext
        .setVisible(false)
        .setAlpha(1);

    presentation.countdownText
        .setVisible(false)
        .setAlpha(1)
        .setScale(1);

    presentation.active = false;
    presentation.scoredSide = null;
    presentation.resetTimer = null;

    state.playStopped = false;

    state.possession.pickupCooldown = 0;

    givePuckToPlayer(
        scene
    );

    updateContextualActionButton(
        scene
    );
}

function freezeGameplayDuringGoal(scene) {
    const state =
        scene.gameState;

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    state.movement.directionX = 0;
    state.movement.directionY = 0;
    state.movement.strength = 0;

    for (
        const teammate
        of state.teammates
    ) {
        teammate.velocityX = 0;
        teammate.velocityY = 0;

        updateTeammateVisuals(
            teammate
        );
    }
}

/* =========================================================
   CENTER RESET
========================================================= */

function resetPlayersForCenterFaceoff(
    scene,
    afterGoal
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    state.possession.owner = null;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    state.possession.pickupCooldown =
        afterGoal
            ? 999
            : 0;

    state.passCall.active = false;
    state.passCall.displayTimer = 0;

    state.playerStats.lastShooter = null;
    state.playerStats.lastPasser = null;

    state.actionButton.cooldown = 0;

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.facingAngle =
        -Math.PI / 2;

    state.targetFacingAngle =
        -Math.PI / 2;

    state.facingX = 0;
    state.facingY = -1;

    state.player.setPosition(
        rink.centerX,
        rink.centerY + 66
    );

    resetGoalie(
        scene
    );

    const positions = [
        {
            x:
                rink.centerX - 72,

            y:
                rink.centerY + 22
        },

        {
            x:
                rink.centerX + 72,

            y:
                rink.centerY + 22
        }
    ];

    for (
        let index = 0;
        index <
        state.teammates.length;
        index += 1
    ) {
        const teammate =
            state.teammates[index];

        const position =
            positions[index] ||
            positions[0];

        teammate.body.setPosition(
            position.x,
            position.y
        );

        teammate.velocityX = 0;
        teammate.velocityY = 0;

        teammate.facingX = 0;
        teammate.facingY = -1;

        teammate.targetX =
            position.x;

        teammate.targetY =
            position.y;

        teammate.possessionTime = 0;

        teammate.decisionTimer =
            Phaser.Math.FloatBetween(
                0.8,
                1.3
            );

        updateTeammateVisuals(
            teammate
        );
    }

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    resetMovementJoystick(
        scene
    );

    resetAimJoystick(
        scene
    );

    state.sprinting = false;

    updateSprintButtonAppearance(
        scene
    );

    updatePlayerStick(
        scene
    );

    updatePlayerIndicator(
        scene
    );

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    state.puck.setPosition(
        playerGeometry.puckAnchorX,
        playerGeometry.puckAnchorY
    );

    if (
        !afterGoal
    ) {
        givePuckToPlayer(
            scene
        );
    }

    updateContextualActionButton(
        scene
    );
}

/* =========================================================
   GOAL GEOMETRY AND COLLISIONS
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
        mouthHalfWidth,
        backHalfWidth,
        depth,
        topLineY,
        bottomLineY,

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

function getLineCrossingX(
    previousX,
    previousY,
    currentX,
    currentY,
    lineY
) {
    const verticalTravel =
        currentY -
        previousY;

    if (
        Math.abs(
            verticalTravel
        ) < 0.0001
    ) {
        return currentX;
    }

    const interpolation =
        Phaser.Math.Clamp(
            (
                lineY -
                previousY
            ) /
            verticalTravel,
            0,
            1
        );

    return Phaser.Math.Linear(
        previousX,
        currentX,
        interpolation
    );
}

function isCrossingInsideGoalMouth(
    state,
    crossingX
) {
    const geometry =
        getGoalGeometry(
            state
        );

    const innerLeft =
        state.rink.centerX -
        geometry.mouthHalfWidth +
        state.puckRadius;

    const innerRight =
        state.rink.centerX +
        geometry.mouthHalfWidth -
        state.puckRadius;

    return (
        crossingX >= innerLeft &&
        crossingX <= innerRight
    );
}

function handleGoalNetCollisions(scene) {
    const state =
        scene.gameState;

    if (
        state.possession.owner ||
        state.playStopped
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
            state.puck,
            postX,
            postY,
            state.puckRadius + 3.5,
            0.72
        );
    }

    for (
        const segment
        of geometry.segments
    ) {
        resolvePuckSegmentCollision(
            state,
            state.puck,
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
        puck.x -
        closest.x;

    const deltaY =
        puck.y -
        closest.y;

    const distanceSquared =
        deltaX * deltaX +
        deltaY * deltaY;

    const collisionRadius =
        state.puckRadius + 1.4;

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

    if (
        distance > 0.001
    ) {
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
        normalX *
        (
            overlap + 0.15
        );

    puck.y +=
        normalY *
        (
            overlap + 0.15
        );

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (
        velocityAlongNormal < 0
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
        puck.x -
        centerX;

    const deltaY =
        puck.y -
        centerY;

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

    if (
        distance > 0.001
    ) {
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
            overlap + 0.35
        );

    puck.y +=
        normalY *
        (
            overlap + 0.35
        );

    const velocityAlongNormal =
        state.puckVelocityX *
            normalX +
        state.puckVelocityY *
            normalY;

    if (
        velocityAlongNormal < 0
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
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (
            distance >
                innerCornerRadius &&
            distance > 0
        ) {
            correctedX =
                cornerX +
                deltaX /
                distance *
                innerCornerRadius;

            correctedY =
                cornerY +
                deltaY /
                distance *
                innerCornerRadius;

            hitX = true;
            hitY = true;
        }
    }

    return {
        x: correctedX,
        y: correctedY,
        hitX,
        hitY
    };
}

})();