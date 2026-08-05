/* =========================================================
   HOCKEY LEGACY
   VERSION 0.0.69

   CONTROL FIX
   - Right joystick ALWAYS shoots.
   - It never automatically passes.
   - PASS/CALL PASS is a separate contextual button.
   - Player begins with the puck after every restart.
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

const game =
    new Phaser.Game(config);

/* =========================================================
   CREATE
========================================================= */

function create() {
    const scene = this;

    scene.cameras.main.setRoundPixels(true);

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

        score: {
            top: 0,
            bottom: 0,

            panel: null,
            label: null,
            text: null
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
            cooldownLength: 0.75,

            flashTimer: null
        },

        passCall: {
            active: false,
            displayTimer: 0,

            ring: null,
            text: null
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

    const buttonY =
        versionY + 115;

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
            "Version 0.0.69",
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
            "▶ PLAY",
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

        titleText.setVisible(false);
        versionText.setVisible(false);

        button.setVisible(false);
        buttonText.setVisible(false);

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

        createPlayer(
            scene
        );

        createTeammates(
            scene
        );

        createPuck(
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

        updateActionButtonAppearance(
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

    updateActionButtonAppearance(
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
        rink.top + 25;

    state.score.panel =
        scene.add.rectangle(
            scoreboardX,
            scoreboardY,
            76,
            31,
            0x102d4e,
            0.94
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
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
                    "17px",

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

    resetMovementJoystick(scene);
    resetAimJoystick(scene);

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

    updateScoreboard(scene);

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
            2100,
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

        ease:
            "Back.Out",

        yoyo: true,

        hold: 650
    });

    scene.tweens.add({
        targets:
            presentation.subtext,

        alpha: 1,

        duration: 180
    });

    const activeLight =
        scoredSide === "top"
            ? presentation.topLight
            : presentation.bottomLight;

    const activeGlow =
        scoredSide === "top"
            ? presentation.topGlow
            : presentation.bottomGlow;

    activeLight
        .setFillStyle(
            0xff1111,
            1
        )
        .setAlpha(1)
        .setScale(1);

    activeGlow
        .setFillStyle(
            0xff0000,
            0.52
        )
        .setAlpha(1)
        .setScale(1);

    scene.tweens.add({
        targets: [
            activeLight,
            activeGlow
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
    const presentation =
        scene.gameState
            .goalPresentation;

    if (!presentation.active) {
        return;
    }

    if (number <= 0) {
        presentation.countdownText
            .setText("GO!")
            .setVisible(true)
            .setAlpha(1)
            .setScale(1.2);

        presentation.subtext
            .setText(
                "You start with the puck"
            );

        scene.tweens.add({
            targets:
                presentation.countdownText,

            alpha: 0,

            scaleX: 1.6,
            scaleY: 1.6,

            duration: 400,

            ease:
                "Cubic.Out"
        });

        scene.time.delayedCall(
            410,
            () => {
                finishGoalRestart(
                    scene
                );
            }
        );

        return;
    }

    presentation.countdownText
        .setText(String(number))
        .setVisible(true)
        .setAlpha(1)
        .setScale(0.65);

    scene.tweens.add({
        targets:
            presentation.countdownText,

        scaleX: 1.2,
        scaleY: 1.2,

        duration: 210,

        ease:
            "Back.Out",

        yoyo: true,

        onComplete: () => {
            scene.time.delayedCall(
                260,
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
        .setVisible(false);

    presentation.subtext
        .setVisible(false);

    presentation.countdownText
        .setVisible(false)
        .setAlpha(1)
        .setScale(1);

    presentation.active = false;
    presentation.scoredSide = null;
    presentation.resetTimer = null;

    state.playStopped = false;

    state.possession.pickupCooldown = 0;

    givePuckToPlayer(scene);

    updateActionButtonAppearance(
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
            positions[index];

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

    resetMovementJoystick(scene);
    resetAimJoystick(scene);

    state.sprinting = false;

    updateSprintButtonAppearance(
        scene
    );

    updatePlayerStick(scene);
    updatePlayerIndicator(scene);

    const geometry =
        getPlayerStickGeometry(
            state
        );

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

    if (!afterGoal) {
        givePuckToPlayer(scene);
    }

    updateActionButtonAppearance(
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

        graphics.fillStyle(
            0xff3b30,
            1
        );

        graphics.fillCircle(
            x,
            y,
            3
        );
    }

    const dots = [
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
        of dots
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

    const outside = 5;
    const inside = 2;
    const gap = 5;

    const lines = [
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
        of lines
    ) {
        graphics.lineBetween(
            line[0],
            line[1],
            line[2],
            line[3]
        );
    }
}

function drawGoalsAndCreases(
    graphics,
    rink
) {
    const topY =
        rink.top + 44;

    const bottomY =
        rink.bottom - 44;

    drawGoalCrease(
        graphics,
        rink.centerX,
        topY,
        "top"
    );

    drawGoalCrease(
        graphics,
        rink.centerX,
        bottomY,
        "bottom"
    );

    graphics.lineStyle(
        3,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        rink.left + 4,
        topY,
        rink.right - 4,
        topY
    );

    graphics.lineBetween(
        rink.left + 4,
        bottomY,
        rink.right - 4,
        bottomY
    );

    drawGoalNet(
        graphics,
        rink.centerX,
        topY,
        "top"
    );

    drawGoalNet(
        graphics,
        rink.centerX,
        bottomY,
        "bottom"
    );
}

function drawGoalCrease(
    graphics,
    centerX,
    goalLineY,
    side
) {
    const depth = 32;

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

    if (side === "top") {
        graphics.moveTo(
            centerX - 34,
            goalLineY
        );

        graphics.lineTo(
            centerX + 34,
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
            centerX + 34,
            goalLineY
        );

        graphics.lineTo(
            centerX - 34,
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

    const backY =
        goalLineY +
        28 * direction;

    graphics.lineStyle(
        1,
        0x9fb3c8,
        1
    );

    graphics.lineBetween(
        centerX - 20,
        goalLineY,
        centerX - 14,
        backY
    );

    graphics.lineBetween(
        centerX - 14,
        backY,
        centerX + 14,
        backY
    );

    graphics.lineBetween(
        centerX + 14,
        backY,
        centerX + 20,
        goalLineY
    );

    graphics.lineBetween(
        centerX - 18,
        goalLineY +
            9 * direction,
        centerX + 18,
        goalLineY +
            9 * direction
    );

    graphics.lineBetween(
        centerX - 16,
        goalLineY +
            18 * direction,
        centerX + 16,
        goalLineY +
            18 * direction
    );

    for (
        const offset
        of [-12, -6, 0, 6, 12]
    ) {
        graphics.lineBetween(
            centerX + offset,
            goalLineY,
            centerX +
                offset * 0.72,
            backY
        );
    }

    graphics.lineStyle(
        4,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        centerX - 20,
        goalLineY,
        centerX + 20,
        goalLineY
    );

    graphics.lineBetween(
        centerX - 20,
        goalLineY,
        centerX - 14,
        backY
    );

    graphics.lineBetween(
        centerX + 20,
        goalLineY,
        centerX + 14,
        backY
    );

    graphics.lineBetween(
        centerX - 14,
        backY,
        centerX + 14,
        backY
    );
}

function drawGoalieTrapezoids(
    graphics,
    rink
) {
    const topY =
        rink.top + 44;

    const bottomY =
        rink.bottom - 44;

    graphics.lineStyle(
        2,
        0xff3b30,
        1
    );

    graphics.lineBetween(
        rink.centerX - 30,
        topY,
        rink.centerX - 48,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX + 30,
        topY,
        rink.centerX + 48,
        rink.top + 5
    );

    graphics.lineBetween(
        rink.centerX - 30,
        bottomY,
        rink.centerX - 48,
        rink.bottom - 5
    );

    graphics.lineBetween(
        rink.centerX + 30,
        bottomY,
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

    state.player =
        scene.add.circle(
            state.rink.centerX,
            state.rink.centerY + 66,
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
            state.player.x,
            state.player.y - 21,

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

function updatePlayerIndicator(scene) {
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

    const teammate = {
        body:
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
                .setDepth(20),

        stick:
            scene.add.graphics()
                .setDepth(21),

        label:
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
                        "#ffffff"
                }
            )
                .setOrigin(0.5)
                .setDepth(24),

        targetRing:
            scene.add.graphics()
                .setDepth(18),

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

    updateTeammateVisuals(
        teammate
    );
}

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

    if (owner) {
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

    if (chaser === teammate) {
        teammate.targetX =
            state.puck.x;

        teammate.targetY =
            state.puck.y;

        return;
    }

    teammate.targetX =
        state.rink.centerX +
        teammate.laneOffsetX;

    teammate.targetY =
        Phaser.Math.Clamp(
            state.puck.y + 42,
            state.rink.top + 100,
            state.rink.bottom - 90
        );
}

function chooseSupportTargetForPlayer(
    state,
    teammate
) {
    const player =
        state.player;

    if (
        player.y >=
        state.rink.centerY
    ) {
        teammate.targetX =
            state.rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            player.y - 80;

        return;
    }

    const playerOnLeft =
        player.x <
        state.rink.centerX;

    const farSide =
        (
            playerOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !playerOnLeft &&
            teammate.side === "left"
        );

    if (farSide) {
        teammate.targetX =
            state.rink.centerX +
            (
                teammate.side === "left"
                    ? -48
                    : 48
            );

        teammate.targetY =
            state.offensiveGoal.y + 80;
    } else {
        teammate.targetX =
            state.rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            Phaser.Math.Clamp(
                player.y + 55,
                state.offensiveGoal.y + 125,
                state.rink.centerY - 15
            );
    }
}

function chooseSupportTargetForTeammate(
    state,
    teammate,
    carrier
) {
    if (teammate === carrier) {
        return;
    }

    const carrierOnLeft =
        carrier.body.x <
        state.rink.centerX;

    const farSide =
        (
            carrierOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !carrierOnLeft &&
            teammate.side === "left"
        );

    if (farSide) {
        teammate.targetX =
            state.rink.centerX +
            (
                teammate.side === "left"
                    ? -45
                    : 45
            );

        teammate.targetY =
            state.offensiveGoal.y + 75;
    } else {
        teammate.targetX =
            state.rink.centerX +
            teammate.laneOffsetX;

        teammate.targetY =
            Phaser.Math.Clamp(
                carrier.body.y + 60,
                state.offensiveGoal.y + 130,
                state.rink.centerY - 10
            );
    }
}

function choosePuckCarrierTarget(
    state,
    teammate
) {
    const distance =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            state.offensiveGoal.x,
            state.offensiveGoal.y
        );

    if (distance > 190) {
        teammate.targetX =
            state.rink.centerX +
            (
                teammate.side === "left"
                    ? -50
                    : 50
            );

        teammate.targetY =
            state.offensiveGoal.y + 145;
    } else if (distance > 105) {
        teammate.targetX =
            state.rink.centerX +
            (
                teammate.side === "left"
                    ? -32
                    : 32
            );

        teammate.targetY =
            state.offensiveGoal.y + 90;
    } else {
        teammate.targetX =
            state.rink.centerX +
            teammate.cycleDirection * 18;

        teammate.targetY =
            state.offensiveGoal.y + 64;
    }
}

function findLoosePuckChaser(state) {
    let closest = null;
    let bestDistance = Infinity;

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

        if (distance < bestDistance) {
            bestDistance = distance;
            closest = teammate;
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
        bestDistance * 0.82
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

        if (speed > 4) {
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

    const length =
        Math.sqrt(
            desiredX * desiredX +
            desiredY * desiredY
        );

    if (length < 0.001) {
        return;
    }

    const targetAngle =
        Math.atan2(
            desiredY / length,
            desiredX / length
        );

    const currentAngle =
        Math.atan2(
            teammate.facingY,
            teammate.facingX
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

    const minimum =
        state.playerRadius +
        state.teammateRadius +
        4;

    if (
        distance >= minimum ||
        distance < 0.001
    ) {
        return;
    }

    teammate.body.x +=
        deltaX / distance *
        (minimum - distance) *
        0.6;

    teammate.body.y +=
        deltaY / distance *
        (minimum - distance) *
        0.6;
}

function separateTeammates(
    state,
    teammate
) {
    for (
        const other
        of state.teammates
    ) {
        if (other === teammate) {
            continue;
        }

        const deltaX =
            teammate.body.x -
            other.body.x;

        const deltaY =
            teammate.body.y -
            other.body.y;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        const minimum =
            state.teammateRadius * 2 +
            5;

        if (
            distance >= minimum ||
            distance < 0.001
        ) {
            continue;
        }

        teammate.body.x +=
            deltaX / distance *
            (minimum - distance) *
            0.5;

        teammate.body.y +=
            deltaY / distance *
            (minimum - distance) *
            0.5;
    }
}

/* =========================================================
   STICK GEOMETRY
========================================================= */

function getPlayerStickGeometry(state) {
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

    return {
        perpendicularX,
        perpendicularY,

        bladeStartX,
        bladeStartY,

        bladeEndX:
            bladeStartX +
            perpendicularX * 9,

        bladeEndY:
            bladeStartY +
            perpendicularY * 9,

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

    return {
        perpendicularX,
        perpendicularY,

        bladeStartX,
        bladeStartY,

        bladeEndX:
            bladeStartX +
            perpendicularX * 8,

        bladeEndY:
            bladeStartY +
            perpendicularY * 8,

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

    if (!state.playerStick) {
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
   PUCK AND POSSESSION
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
            .setDepth(22);
}

function updatePossession(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    state.possession.pickupCooldown =
        Math.max(
            0,
            state.possession
                .pickupCooldown -
                deltaSeconds
        );

    if (!state.possession.owner) {
        return;
    }

    hardLockPossessedPuck(
        scene
    );

    if (
        state.possession.owner !==
        state.player
    ) {
        updateAIPuckDecision(
            scene,
            state.possession.owner,
            deltaSeconds
        );
    }
}

function hardLockPossessedPuck(scene) {
    const state =
        scene.gameState;

    const owner =
        state.possession.owner;

    if (!owner) {
        return;
    }

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    const geometry =
        owner === state.player
            ? getPlayerStickGeometry(
                state
            )
            : getTeammateStickGeometry(
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

    if (state.playStopped) {
        return;
    }

    state.possession.owner =
        state.player;

    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    state.passCall.active = false;
    state.passCall.displayTimer = 0;

    hardLockPossessedPuck(scene);

    updateActionButtonAppearance(
        scene
    );
}

function givePuckToTeammate(
    scene,
    teammate
) {
    const state =
        scene.gameState;

    if (state.playStopped) {
        return;
    }

    state.possession.owner =
        teammate;

    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    teammate.possessionTime = 0;

    teammate.decisionTimer =
        Phaser.Math.FloatBetween(
            0.55,
            1.1
        );

    hardLockPossessedPuck(scene);

    updateActionButtonAppearance(
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

    if (
        state.possession.owner ||
        state.possession
            .pickupCooldown > 0
    ) {
        return;
    }

    if (
        state.possession.passTargetType ===
            "player" &&
        state.possession.passTarget ===
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

        if (distance <= 24) {
            givePuckToPlayer(scene);
            return;
        }
    }

    if (
        state.possession.passTargetType ===
            "teammate" &&
        state.possession.passTarget
    ) {
        const geometry =
            getTeammateStickGeometry(
                state.possession.passTarget
            );

        const distance =
            Phaser.Math.Distance.Between(
                state.puck.x,
                state.puck.y,
                geometry.puckAnchorX,
                geometry.puckAnchorY
            );

        if (distance <= 24) {
            givePuckToTeammate(
                scene,
                state.possession.passTarget
            );

            return;
        }
    }

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const playerDistance =
        distanceFromPointToSegment(
            state.puck.x,
            state.puck.y,

            playerGeometry.bladeStartX,
            playerGeometry.bladeStartY,

            playerGeometry.bladeEndX,
            playerGeometry.bladeEndY
        );

    let closestType = "player";
    let closestTarget =
        state.player;

    let closestDistance =
        playerDistance;

    for (
        const teammate
        of state.teammates
    ) {
        const geometry =
            getTeammateStickGeometry(
                teammate
            );

        const distance =
            distanceFromPointToSegment(
                state.puck.x,
                state.puck.y,

                geometry.bladeStartX,
                geometry.bladeStartY,

                geometry.bladeEndX,
                geometry.bladeEndY
            );

        if (
            distance <
            closestDistance
        ) {
            closestDistance = distance;
            closestType = "teammate";
            closestTarget = teammate;
        }
    }

    if (
        closestDistance >
        state.possession.pickupRadius
    ) {
        return;
    }

    if (
        closestType === "player"
    ) {
        givePuckToPlayer(scene);
    } else {
        givePuckToTeammate(
            scene,
            closestTarget
        );
    }
}

/* =========================================================
   AI DECISIONS
========================================================= */

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

    const distanceToGoal =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            state.offensiveGoal.x,
            state.offensiveGoal.y
        );

    let shotChance = 0;

    if (distanceToGoal < 85) {
        shotChance = 0.82;
    } else if (
        distanceToGoal < 125
    ) {
        shotChance = 0.58;
    } else if (
        distanceToGoal < 180
    ) {
        shotChance = 0.24;
    }

    if (
        state.passCall.active &&
        distanceToGoal >= 90
    ) {
        shotChance *= 0.4;
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

    const target =
        chooseAIPassTarget(
            state,
            teammate
        );

    let passChance = 0.43;

    if (
        state.passCall.active &&
        target &&
        target.type === "player"
    ) {
        passChance = 0.9;
    }

    if (
        target &&
        (
            Math.random() <
                passChance ||
            teammate.possessionTime >
                2.9
        )
    ) {
        passFromTeammate(
            scene,
            teammate,
            target
        );
    }
}

function chooseAIPassTarget(
    state,
    teammate
) {
    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const candidates = [
        {
            type: "player",
            target: state.player,

            x:
                playerGeometry.puckAnchorX,

            y:
                playerGeometry.puckAnchorY
        }
    ];

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
    let bestScore = -Infinity;

    for (
        const candidate
        of candidates
    ) {
        const distance =
            Phaser.Math.Distance.Between(
                teammate.body.x,
                teammate.body.y,
                candidate.x,
                candidate.y
            );

        if (
            distance < 45 ||
            distance > 270
        ) {
            continue;
        }

        let score =
            (
                teammate.body.y -
                candidate.y
            ) * 0.015;

        score +=
            Math.min(
                distance / 130,
                1
            );

        score +=
            Math.random() * 0.7;

        if (
            state.passCall.active &&
            candidate.type ===
                "player"
        ) {
            score += 3;
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

    let directionX =
        state.offensiveGoal.x +
        Phaser.Math.Between(
            -10,
            10
        ) -
        geometry.puckAnchorX;

    let directionY =
        state.offensiveGoal.y -
        12 -
        geometry.puckAnchorY;

    const length =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (length < 0.001) {
        return;
    }

    directionX /= length;
    directionY /= length;

    releasePossession(
        state,
        0.24
    );

    state.passCall.active = false;

    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

    const speed =
        Phaser.Math.Between(
            350,
            475
        );

    state.puckVelocityX =
        directionX * speed;

    state.puckVelocityY =
        directionY * speed;

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

    const start =
        getTeammateStickGeometry(
            teammate
        );

    let targetX;
    let targetY;

    if (
        passTarget.type === "player"
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
            passTarget.target.velocityX *
                0.1;

        targetY =
            target.puckAnchorY +
            passTarget.target.velocityY *
                0.1;
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

    if (distance < 0.001) {
        return;
    }

    directionX /= distance;
    directionY /= distance;

    const speed =
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
        directionX * speed;

    state.puckVelocityY =
        directionY * speed;

    teammate.possessionTime = 0;

    if (
        passTarget.type === "player"
    ) {
        state.passCall.active = false;
    }
}

/* =========================================================
   CONTEXTUAL PASS / CALL PASS BUTTON
========================================================= */

function useActionButton(scene) {
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

    if (owner === state.player) {
        passToBestTeammate(scene);
        return;
    }

    if (
        owner &&
        owner !== state.player
    ) {
        requestPass(scene);
        return;
    }

    flashActionButton(
        scene,
        "NO PUCK",
        0x8f2020
    );

    state.actionButton.cooldown = 0.3;
}

function passToBestTeammate(scene) {
    const state =
        scene.gameState;

    if (
        state.possession.owner !==
        state.player
    ) {
        return;
    }

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
    let bestScore = -Infinity;

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

        let score = 0;

        /*
         * Prefer teammates farther toward
         * the offensive top net.
         */
        score +=
            (
                state.player.y -
                teammate.body.y
            ) * 0.025;

        /*
         * Prefer a teammate matching the
         * direction the player is facing.
         */
        const directionX =
            deltaX / distance;

        const directionY =
            deltaY / distance;

        const facingDot =
            state.facingX *
                directionX +
            state.facingY *
                directionY;

        score +=
            facingDot * 1.4;

        /*
         * While the shooting joystick is held,
         * it may be used only to choose which
         * teammate receives the separate pass.
         *
         * Releasing the joystick still shoots.
         */
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
                aimDot * 3;
        }

        score +=
            Math.min(
                distance / 150,
                1
            ) * 0.25;

        if (score > bestScore) {
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

    if (distance < 0.001) {
        return;
    }

    directionX /= distance;
    directionY /= distance;

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
        `PASS → ${teammate.name}`,
        0x2477c9
    );
}

function requestPass(scene) {
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

    if (distance < 180) {
        chance += 0.08;
    }

    if (distance > 235) {
        chance -= 0.18;
    }

    if (goalDistance < 85) {
        chance -= 0.45;
    } else if (
        goalDistance < 120
    ) {
        chance -= 0.22;
    }

    chance =
        Phaser.Math.Clamp(
            chance,
            0.15,
            0.96
        );

    if (
        distance >= 42 &&
        distance <= 270 &&
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
    } else {
        carrier.decisionTimer =
            Math.min(
                carrier.decisionTimer,
                0.1
            );

        flashActionButton(
            scene,
            "CALLED",
            0x566b80
        );
    }
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

function updateActionButtonAppearance(
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
                0x566b80,
                0.65
            )
            .setAlpha(0.65);

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
                0x566b80,
                0.8
            )
            .setAlpha(0.8);

        actionButton.label
            .setText("WAIT")
            .setAlpha(0.85);

        return;
    }

    const owner =
        state.possession.owner;

    if (owner === state.player) {
        actionButton.button
            .setFillStyle(
                0x2477c9,
                0.98
            )
            .setAlpha(1);

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
            )
            .setAlpha(1);

        actionButton.label
            .setText("CALL PASS")
            .setAlpha(1);

        return;
    }

    actionButton.button
        .setFillStyle(
            0x566b80,
            0.72
        )
        .setAlpha(0.75);

    actionButton.label
        .setText("NO PUCK")
        .setAlpha(0.8);
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

    if (actionButton.flashTimer) {
        actionButton.flashTimer.remove(
            false
        );
    }

    actionButton.button
        .setFillStyle(
            color,
            1
        )
        .setAlpha(1);

    actionButton.label
        .setText(text)
        .setAlpha(1);

    actionButton.flashTimer =
        scene.time.delayedCall(
            350,
            () => {
                actionButton.flashTimer =
                    null;

                updateActionButtonAppearance(
                    scene
                );
            }
        );
}

/* =========================================================
   PASS CALL VISUALS
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
        scene.gameState.passCall;

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
        !passCall.ring ||
        !passCall.text
    ) {
        return;
    }

    passCall.ring.clear();
    passCall.text.setVisible(false);

    if (
        !passCall.active ||
        state.playStopped
    ) {
        return;
    }

    const pulse =
        18 +
        Math.sin(
            scene.time.now * 0.018
        ) * 3;

    passCall.ring.lineStyle(
        3,
        0x28e7ff,
        0.95
    );

    passCall.ring.strokeCircle(
        state.player.x,
        state.player.y,
        pulse
    );

    passCall.text
        .setPosition(
            state.player.x,
            state.player.y - 35
        )
        .setVisible(true);
}

/* =========================================================
   SHOOTING

   IMPORTANT:
   THIS CONTROL ONLY SHOOTS.
   NO PASS TARGET IS CHECKED HERE.
========================================================= */

function shootPuckInDirection(
    scene,
    directionX,
    directionY,
    speed
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

    const length =
        Math.sqrt(
            directionX * directionX +
            directionY * directionY
        );

    if (length < 0.001) {
        return;
    }

    directionX /= length;
    directionY /= length;

    const geometry =
        getPlayerStickGeometry(
            state
        );

    releasePossession(
        state,
        0.22
    );

    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    state.puck.setPosition(
        geometry.puckAnchorX,
        geometry.puckAnchorY
    );

    state.puckVelocityX =
        directionX * speed +
        state.playerVelocityX *
            0.08;

    state.puckVelocityY =
        directionY * speed +
        state.playerVelocityY *
            0.08;

    updateActionButtonAppearance(
        scene
    );
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

    const targetX =
        movement.directionX *
        maximumSpeed *
        movement.strength;

    const targetY =
        movement.directionY *
        maximumSpeed *
        movement.strength;

    const changeRate =
        movement.strength > 0.01
            ? acceleration
            : state.playerDeceleration;

    state.playerVelocityX =
        moveToward(
            state.playerVelocityX,
            targetX,
            changeRate *
                deltaSeconds
        );

    state.playerVelocityY =
        moveToward(
            state.playerVelocityY,
            targetY,
            changeRate *
                deltaSeconds
        );

    if (
        movement.strength > 0.01 &&
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

    const maximumTurn =
        state.turnSpeed *
        (
            state.sprinting
                ? 0.8
                : 1
        ) *
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

    if (corrected.hitX) {
        state.playerVelocityX = 0;
    }

    if (corrected.hitY) {
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

    if (state.playStopped) {
        return;
    }

    const travelDistance =
        Math.sqrt(
            state.puckVelocityX *
                state.puckVelocityX +
            state.puckVelocityY *
                state.puckVelocityY
        ) *
        deltaSeconds;

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

        checkForPuckPickup(scene);

        if (
            state.possession.owner ||
            state.playStopped
        ) {
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
   GOAL DETECTION
========================================================= */

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

    if (
        previousY >
            geometry.topLineY &&
        currentY <=
            geometry.topLineY
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

    if (
        previousY <
            geometry.bottomLineY &&
        currentY >=
            geometry.bottomLineY
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
        Math.abs(verticalTravel) <
        0.0001
    ) {
        return currentX;
    }

    const amount =
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
        amount
    );
}

function isCrossingInsideGoalMouth(
    state,
    x
) {
    const geometry =
        getGoalGeometry(
            state
        );

    return (
        x >=
            state.rink.centerX -
            geometry.mouthHalfWidth +
            state.puckRadius &&
        x <=
            state.rink.centerX +
            geometry.mouthHalfWidth -
            state.puckRadius
    );
}

/* =========================================================
   AIM GUIDE

   THE GUIDE IS ALWAYS YELLOW BECAUSE
   RELEASING THIS CONTROL ALWAYS SHOOTS.
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
        0.9
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

    aim.powerBar.fillStyle(
        0x111111,
        0.72
    );

    aim.powerBar.fillRoundedRect(
        aim.centerX -
            barWidth / 2,
        aim.centerY - 60,
        barWidth,
        8,
        4
    );

    aim.powerBar.fillStyle(
        guideColor,
        0.95
    );

    aim.powerBar.fillRoundedRect(
        aim.centerX -
            barWidth / 2,
        aim.centerY - 60,
        barWidth *
            aim.strength,
        8,
        4
    );
}

function updateTeammateIndicators(
    scene
) {
    const state =
        scene.gameState;

    const passTarget =
        (
            state.possession.owner ===
                state.player
        )
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
            state.possession.owner ===
                state.player
        ) {
            teammate.targetRing.lineStyle(
                2,
                0x28e7ff,
                0.75
            );

            teammate.targetRing.strokeCircle(
                teammate.body.x,
                teammate.body.y,
                15
            );
        }
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
            scene.scale.height - 115
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

    createActionButton(
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
        scene.gameState.movement;

    movement.centerX = x;
    movement.centerY = y;

    movement.base =
        scene.add.circle(
            x,
            y,
            movement.baseRadius,
            0x17375e,
            0.74
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
            )
            .setDepth(100);

    movement.knob =
        scene.add.circle(
            x,
            y,
            movement.knobRadius,
            0x2f71b7,
            1
        )
            .setStrokeStyle(
                2,
                0xffffff,
                1
            )
            .setDepth(101);

    scene.add.circle(
        x,
        y,
        movement.baseRadius + 14,
        0xffffff,
        0.001
    )
        .setDepth(102)
        .setInteractive()
        .on(
            "pointerdown",
            pointer => {
                if (
                    scene.gameState
                        .playStopped
                ) {
                    return;
                }

                if (movement.active) {
                    return;
                }

                movement.active = true;
                movement.pointerId =
                    pointer.id;

                movement.base
                    .setFillStyle(
                        0x234f7f,
                        0.86
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
            0.76
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
            )
            .setDepth(100);

    aim.knob =
        scene.add.circle(
            x,
            y,
            aim.knobRadius,
            0xe04444,
            1
        )
            .setStrokeStyle(
                2,
                0xffffff,
                1
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

    scene.add.circle(
        x,
        y,
        aim.baseRadius + 16,
        0xffffff,
        0.001
    )
        .setDepth(103)
        .setInteractive()
        .on(
            "pointerdown",
            pointer => {
                if (
                    scene.gameState
                        .playStopped
                ) {
                    return;
                }

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

function createActionButton(
    scene,
    x,
    y
) {
    const state =
        scene.gameState;

    state.actionButton.button =
        scene.add.rectangle(
            x,
            y,
            104,
            38,
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

    state.actionButton.label =
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

    const activate = (
        pointer,
        localX,
        localY,
        event
    ) => {
        useActionButton(scene);

        if (
            event &&
            event.stopPropagation
        ) {
            event.stopPropagation();
        }
    };

    state.actionButton.button.on(
        "pointerdown",
        activate
    );

    state.actionButton.label.on(
        "pointerdown",
        activate
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
            92,
            38,
            0x1769d2,
            0.96
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.95
            )
            .setDepth(110)
            .setInteractive();

    const label =
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
            .setInteractive();

    state.sprintButton = {
        button,
        label
    };

    const toggle = (
        pointer,
        localX,
        localY,
        event
    ) => {
        if (state.playStopped) {
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

    button.on(
        "pointerdown",
        toggle
    );

    label.on(
        "pointerdown",
        toggle
    );
}

function updateSprintButtonAppearance(
    scene
) {
    const state =
        scene.gameState;

    if (!state.sprintButton) {
        return;
    }

    state.sprintButton.button
        .setFillStyle(
            state.sprinting
                ? 0x35a85d
                : 0x1769d2,
            1
        );

    state.sprintButton.label
        .setText(
            state.sprinting
                ? "SPRINT ON"
                : "SPRINT OFF"
        );
}

/* =========================================================
   JOYSTICK INPUT
========================================================= */

function updateMovementPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    if (
        movement.active &&
        movement.pointerId ===
            pointer.id
    ) {
        updateMovementFromPointer(
            scene,
            pointer
        );
    }
}

function updateMovementFromPointer(
    scene,
    pointer
) {
    const movement =
        scene.gameState.movement;

    setJoystickDirection(
        movement,
        pointer
    );
}

function updateAimPointer(
    scene,
    pointer
) {
    const aim =
        scene.gameState.aim;

    if (
        aim.active &&
        aim.pointerId ===
            pointer.id
    ) {
        updateAimFromPointer(
            scene,
            pointer
        );
    }
}

function updateAimFromPointer(
    scene,
    pointer
) {
    const state =
        scene.gameState;

    const aim =
        state.aim;

    setJoystickDirection(
        aim,
        pointer
    );

    if (aim.strength > 0.01) {
        state.targetFacingAngle =
            Math.atan2(
                aim.directionY,
                aim.directionX
            );
    }

    aim.label.setPosition(
        aim.knob.x,
        aim.knob.y
    );
}

function setJoystickDirection(
    joystick,
    pointer
) {
    const deltaX =
        pointer.x -
        joystick.centerX;

    const deltaY =
        pointer.y -
        joystick.centerY;

    const distance =
        Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

    joystick.distance =
        distance;

    if (distance < 4) {
        joystick.directionX = 0;
        joystick.directionY = 0;
        joystick.strength = 0;

        joystick.knob.setPosition(
            joystick.centerX,
            joystick.centerY
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
            joystick.maximumDistance
        );

    joystick.directionX =
        directionX;

    joystick.directionY =
        directionY;

    joystick.strength =
        Phaser.Math.Clamp(
            clampedDistance /
                joystick.maximumDistance,
            0,
            1
        );

    joystick.knob.setPosition(
        joystick.centerX +
            directionX *
            clampedDistance,

        joystick.centerY +
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
        movement.active &&
        movement.pointerId ===
            pointer.id
    ) {
        resetMovementJoystick(
            scene
        );
    }
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
     * The joystick release only shoots.
     * There is no pass detection here.
     */
    if (
        !state.playStopped &&
        shouldShoot &&
        aim.strength > 0.08
    ) {
        const shotSpeed =
            90 +
            aim.strength * 430;

        shootPuckInDirection(
            scene,
            aim.directionX,
            aim.directionY,
            shotSpeed
        );
    }

    resetAimJoystick(scene);
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
            0.74
        );
    }
}

function resetAimJoystick(scene) {
    const aim =
        scene.gameState.aim;

    aim.active = false;
    aim.pointerId = null;

    aim.directionX = 0;
    aim.directionY = -1;

    aim.strength = 0;
    aim.distance = 0;

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
            0.76
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

function createKeyboardControls(scene) {
    if (
        !scene.input.keyboard
    ) {
        return;
    }

    scene.gameState.keyboard =
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

            a:
                Phaser.Input.Keyboard
                    .KeyCodes.A,

            s:
                Phaser.Input.Keyboard
                    .KeyCodes.S,

            d:
                Phaser.Input.Keyboard
                    .KeyCodes.D,

            space:
                Phaser.Input.Keyboard
                    .KeyCodes.SPACE,

            action:
                Phaser.Input.Keyboard
                    .KeyCodes.C
        });
}

function updateKeyboardInput(scene) {
    const state =
        scene.gameState;

    const keyboard =
        state.keyboard;

    if (!keyboard) {
        return;
    }

    let x = 0;
    let y = 0;

    if (
        keyboard.left.isDown ||
        keyboard.a.isDown
    ) {
        x -= 1;
    }

    if (
        keyboard.right.isDown ||
        keyboard.d.isDown
    ) {
        x += 1;
    }

    if (
        keyboard.up.isDown ||
        keyboard.w.isDown
    ) {
        y -= 1;
    }

    if (
        keyboard.down.isDown ||
        keyboard.s.isDown
    ) {
        y += 1;
    }

    if (
        x !== 0 ||
        y !== 0
    ) {
        const length =
            Math.sqrt(
                x * x +
                y * y
            );

        state.movement.directionX =
            x / length;

        state.movement.directionY =
            y / length;

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
        Phaser.Input.Keyboard.JustDown(
            keyboard.space
        )
    ) {
        shootPuckInDirection(
            scene,
            state.facingX,
            state.facingY,
            380
        );
    }

    if (
        Phaser.Input.Keyboard.JustDown(
            keyboard.action
        )
    ) {
        useActionButton(scene);
    }
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
        const [x, y]
        of geometry.posts
    ) {
        resolvePuckCircleCollision(
            state,
            state.puck,
            x,
            y,
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

    if (distance > 0.001) {
        normalX =
            deltaX / distance;

        normalY =
            deltaY / distance;
    } else {
        const speed =
            Math.sqrt(
                state.puckVelocityX *
                    state.puckVelocityX +
                state.puckVelocityY *
                    state.puckVelocityY
            ) || 1;

        normalX =
            -state.puckVelocityX /
            speed;

        normalY =
            -state.puckVelocityY /
            speed;

        distance = 0;
    }

    const overlap =
        collisionRadius -
        distance;

    puck.x +=
        normalX *
        (
            overlap + 0.25
        );

    puck.y +=
        normalY *
        (
            overlap + 0.25
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

        const dot =
            state.puckVelocityX *
                normalX +
            state.puckVelocityY *
                normalY;

        if (dot > 0) {
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

    const left =
        rink.left +
        objectRadius +
        padding;

    const right =
        rink.right -
        objectRadius -
        padding;

    const top =
        rink.top +
        objectRadius +
        padding;

    const bottom =
        rink.bottom -
        objectRadius -
        padding;

    const radius =
        Math.max(
            rink.cornerRadius -
            objectRadius -
            padding,
            1
        );

    let correctedX =
        Phaser.Math.Clamp(
            x,
            left,
            right
        );

    let correctedY =
        Phaser.Math.Clamp(
            y,
            top,
            bottom
        );

    let hitX =
        correctedX !== x;

    let hitY =
        correctedY !== y;

    let cornerX = null;
    let cornerY = null;

    if (
        correctedX <
            rink.left +
            rink.cornerRadius &&
        correctedY <
            rink.top +
            rink.cornerRadius
    ) {
        cornerX =
            rink.left +
            rink.cornerRadius;

        cornerY =
            rink.top +
            rink.cornerRadius;
    } else if (
        correctedX >
            rink.right -
            rink.cornerRadius &&
        correctedY <
            rink.top +
            rink.cornerRadius
    ) {
        cornerX =
            rink.right -
            rink.cornerRadius;

        cornerY =
            rink.top +
            rink.cornerRadius;
    } else if (
        correctedX <
            rink.left +
            rink.cornerRadius &&
        correctedY >
            rink.bottom -
            rink.cornerRadius
    ) {
        cornerX =
            rink.left +
            rink.cornerRadius;

        cornerY =
            rink.bottom -
            rink.cornerRadius;
    } else if (
        correctedX >
            rink.right -
            rink.cornerRadius &&
        correctedY >
            rink.bottom -
            rink.cornerRadius
    ) {
        cornerX =
            rink.right -
            rink.cornerRadius;

        cornerY =
            rink.bottom -
            rink.cornerRadius;
    }

    if (cornerX !== null) {
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
            distance > radius &&
            distance > 0
        ) {
            correctedX =
                cornerX +
                deltaX / distance *
                radius;

            correctedY =
                cornerY +
                deltaY / distance *
                radius;

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