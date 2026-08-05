/* =========================================================
   HOCKEY LEGACY
   VERSION 0.0.65
========================================================= */

const gameWidth =
    window.innerWidth;

const gameHeight =
    window.innerHeight;

const deviceResolution =
    Math.min(
        window.devicePixelRatio || 1,
        3
    );

const config = {
    type: Phaser.AUTO,

    parent: "game",

    width: gameWidth,
    height: gameHeight,

    resolution:
        deviceResolution,

    backgroundColor:
        "#d8f0ff",

    transparent: false,

    antialias: true,
    pixelArt: false,
    roundPixels: true,

    render: {
        antialias: true,
        antialiasGL: true,
        pixelArt: false,
        roundPixels: true,
        transparent: false,
        powerPreference:
            "high-performance"
    },

    scale: {
        mode:
            Phaser.Scale.NONE,

        autoCenter:
            Phaser.Scale.CENTER_BOTH,

        width:
            gameWidth,

        height:
            gameHeight
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
    new Phaser.Game(
        config
    );

/* =========================================================
   CREATE
========================================================= */

function create() {
    const scene = this;

    scene.cameras.main
        .setRoundPixels(true);

    const rink = {
        width: Math.min(
            330,
            scene.scale.width - 20
        ),

        height: Math.min(
            610,
            scene.scale.height - 24
        ),

        cornerRadius: 55
    };

    rink.centerX =
        Math.round(
            scene.cameras.main.centerX
        );

    rink.centerY =
        Math.round(
            scene.cameras.main.centerY
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
            text: null,
            label: null
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

            resetTimer: null,
            countdownTimer: null
        },

        passCall: {
            active: false,

            cooldown: 0,
            cooldownLength: 1.15,

            displayTimer: 0,

            button: null,
            label: null,

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

    const titleText =
        scene.add.text(
            rink.centerX,
            Math.max(
                75,
                rink.centerY - 170
            ),
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

                resolution:
                    deviceResolution
            }
        )
            .setOrigin(0.5)
            .setDepth(300);

    const versionText =
        scene.add.text(
            rink.centerX,
            Math.max(
                145,
                rink.centerY - 92
            ),
            "Version 0.0.65",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "22px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                resolution:
                    deviceResolution
            }
        )
            .setOrigin(0.5)
            .setDepth(300);

    const playButtonBackground =
        scene.add.rectangle(
            rink.centerX,
            Math.max(
                250,
                rink.centerY + 30
            ),
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

    const playButtonText =
        scene.add.text(
            rink.centerX,
            playButtonBackground.y,
            "▶ PLAY",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "32px",

                fontStyle:
                    "bold",

                color:
                    "#ffff00",

                resolution:
                    deviceResolution
            }
        )
            .setOrigin(0.5)
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

    const beginGame = (
        pointer,
        localX,
        localY,
        event
    ) => {
        const state =
            scene.gameState;

        if (state.gameStarted) {
            return;
        }

        state.gameStarted = true;

        playButtonBackground
            .disableInteractive();

        playButtonText
            .disableInteractive();

        titleText.setVisible(false);
        versionText.setVisible(false);

        playButtonBackground
            .setVisible(false);

        playButtonText
            .setVisible(false);

        scene.cameras.main
            .setBackgroundColor(
                "#d8f0ff"
            );

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

    playButtonBackground.on(
        "pointerdown",
        beginGame
    );

    playButtonText.on(
        "pointerdown",
        beginGame
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
            cancelJoysticks(
                scene
            );
        }
    );

    window.addEventListener(
        "blur",
        () => {
            cancelJoysticks(
                scene
            );
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

        updateTeammateIndicators(
            this
        );

        updatePassCallVisuals(
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
}

/* =========================================================
   SCOREBOARD
========================================================= */

function createScoreboard(
    scene
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    /*
     * The scoreboard now sits near the upper-left
     * boards instead of directly over the net.
     */
    const scoreboardX =
        rink.left + 52;

    const scoreboardY =
        rink.top + 27;

    state.score.panel =
        scene.add.rectangle(
            scoreboardX,
            scoreboardY,
            82,
            34,
            0x102d4e,
            0.94
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
            scoreboardY - 24,
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
                },

                resolution:
                    deviceResolution
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
                    "#ffffff",

                resolution:
                    deviceResolution
            }
        )
            .setOrigin(0.5)
            .setDepth(151);
}

function updateScoreboard(
    scene
) {
    const state =
        scene.gameState;

    if (
        !state.score.text
    ) {
        return;
    }

    state.score.text.setText(
        `${state.score.top} - ${state.score.bottom}`
    );
}
/* =========================================================
   GOAL PRESENTATION
========================================================= */

function createGoalPresentation(
    scene
) {
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
                    7,

                resolution:
                    deviceResolution
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
                },

                resolution:
                    deviceResolution
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
                    5,

                resolution:
                    deviceResolution
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

    const crossedTopLine =
        previousY >
            geometry.topLineY &&
        currentY <=
            geometry.topLineY;

    if (crossedTopLine) {
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

    const crossedBottomLine =
        previousY <
            geometry.bottomLineY &&
        currentY >=
            geometry.bottomLineY;

    if (crossedBottomLine) {
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

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.possession.pickupCooldown =
        999;

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

    startGoalResetCountdown(
        scene
    );
}

function showGoalPresentation(
    scene,
    scoredSide
) {
    const state =
        scene.gameState;

    const presentation =
        state.goalPresentation;

    presentation.banner
        .setVisible(true)
        .setAlpha(0)
        .setScale(0.65);

    presentation.subtext
        .setVisible(true)
        .setAlpha(0);

    presentation.countdownText
        .setVisible(true)
        .setText("3")
        .setAlpha(0)
        .setScale(0.7);

    scene.tweens.add({
        targets:
            presentation.banner,

        alpha: 1,

        scaleX: 1.1,
        scaleY: 1.1,

        duration: 220,

        ease:
            "Back.Out",

        yoyo: true,

        hold: 500
    });

    scene.tweens.add({
        targets:
            presentation.subtext,

        alpha: 1,

        duration: 180
    });

    scene.tweens.add({
        targets:
            presentation.countdownText,

        alpha: 1,

        scaleX: 1,
        scaleY: 1,

        duration: 220,

        ease:
            "Back.Out"
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
            0.5
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
            to: 0.18
        },

        scaleX: {
            from: 1,
            to: 1.5
        },

        scaleY: {
            from: 1,
            to: 1.5
        },

        duration: 170,

        yoyo: true,

        repeat: 8
    });

    scene.cameras.main.flash(
        130,
        255,
        40,
        40,
        false
    );
}

function startGoalResetCountdown(
    scene
) {
    const state =
        scene.gameState;

    const presentation =
        state.goalPresentation;

    if (
        presentation.countdownTimer
    ) {
        presentation.countdownTimer
            .remove(false);
    }

    if (
        presentation.resetTimer
    ) {
        presentation.resetTimer
            .remove(false);
    }

    let countdownValue = 3;

    presentation.countdownText
        .setText(
            countdownValue
        );

    presentation.countdownTimer =
        scene.time.addEvent({
            delay: 650,

            repeat: 2,

            callback: () => {
                countdownValue -= 1;

                if (
                    countdownValue > 0
                ) {
                    presentation
                        .countdownText
                        .setText(
                            countdownValue
                        )
                        .setScale(1.35)
                        .setAlpha(1);

                    scene.tweens.add({
                        targets:
                            presentation
                                .countdownText,

                        scaleX: 1,
                        scaleY: 1,

                        duration: 230,

                        ease:
                            "Back.Out"
                    });
                } else {
                    presentation
                        .countdownText
                        .setText("GO!")
                        .setScale(1.35)
                        .setAlpha(1);

                    scene.tweens.add({
                        targets:
                            presentation
                                .countdownText,

                        scaleX: 1,
                        scaleY: 1,

                        duration: 230,

                        ease:
                            "Back.Out"
                    });
                }
            }
        });

    presentation.resetTimer =
        scene.time.delayedCall(
            2250,
            () => {
                resetAfterGoal(
                    scene
                );
            }
        );
}

function resetAfterGoal(
    scene
) {
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

    if (
        presentation.countdownTimer
    ) {
        presentation.countdownTimer
            .remove(false);
    }

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

    resetPlayersForCenterFaceoff(
        scene,
        true
    );

    presentation.active = false;

    presentation.scoredSide =
        null;

    presentation.resetTimer =
        null;

    presentation.countdownTimer =
        null;

    state.playStopped = false;

    /*
     * The controlled player receives possession
     * immediately after the stoppage ends.
     */
    givePuckToPlayer(
        scene
    );
}

function freezeGameplayDuringGoal(
    scene
) {
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
   CENTER-ICE RESET
========================================================= */

function resetPlayersForCenterFaceoff(
    scene,
    afterGoal
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    state.possession.owner =
        null;

    state.possession.passTarget =
        null;

    state.possession.passTargetType =
        null;

    state.possession.pickupCooldown =
        afterGoal
            ? 0.3
            : 0.2;

    state.passCall.active = false;

    state.passCall.cooldown = 0;

    state.passCall.displayTimer = 0;

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.facingAngle =
        -Math.PI / 2;

    state.targetFacingAngle =
        -Math.PI / 2;

    state.facingX = 0;
    state.facingY = -1;

    state.player.setPosition(
        Math.round(
            rink.centerX
        ),
        Math.round(
            rink.centerY + 72
        )
    );

    const teammatePositions = [
        {
            x:
                rink.centerX - 70,

            y:
                rink.centerY + 30
        },

        {
            x:
                rink.centerX + 70,

            y:
                rink.centerY + 30
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
            teammatePositions[index];

        teammate.body.setPosition(
            Math.round(
                position.x
            ),
            Math.round(
                position.y
            )
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

    /*
     * Every new play currently begins with the
     * controlled player holding the puck.
     */
    state.possession.owner =
        state.player;

    hardLockPossessedPuck(
        scene
    );

    updatePassCallVisuals(
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
        0xf7fcff,
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
        0.76
    );

    graphics.lineStyle(
        3,
        0x4fc3ff,
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
        0x8799ad,
        1
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
        Phaser.Math.DegToRad(
            90
        ),
        Phaser.Math.DegToRad(
            270
        ),
        false
    );

    graphics.strokePath();
}

/* =========================================================
   PLAYER
========================================================= */

function createPlayer(
    scene
) {
    const state =
        scene.gameState;

    state.player =
        scene.add.circle(
            Math.round(
                state.rink.centerX
            ),
            Math.round(
                state.rink.centerY + 72
            ),
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

function createTeammates(
    scene
) {
    const rink =
        scene.gameState.rink;

    createTeammate(
        scene,
        rink.centerX - 70,
        rink.centerY + 30,
        "LW",
        "left"
    );

    createTeammate(
        scene,
        rink.centerX + 70,
        rink.centerY + 30,
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
            Math.round(x),
            Math.round(y),
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

    const label =
        scene.add.text(
            Math.round(x),
            Math.round(y - 19),
            name,
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "10px",

                fontStyle:
                    "bold",

                color:
                    "#123d21",

                backgroundColor:
                    "#ffffff",

                padding: {
                    left: 3,
                    right: 3,
                    top: 1,
                    bottom: 1
                },

                resolution:
                    deviceResolution
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

    const loosePuckChaser =
        findLoosePuckChaser(
            state
        );

    if (
        loosePuckChaser ===
        teammate
    ) {
        teammate.targetX =
            state.puck.x;

        teammate.targetY =
            state.puck.y;

        return;
    }

    teammate.targetX =
        rink.centerX +
        teammate.laneOffsetX;

    teammate.targetY =
        Phaser.Math.Clamp(
            state.puck.y + 45,
            rink.top + 100,
            rink.bottom - 90
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

    if (
        teammateIsFarSide
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
    const rink =
        state.rink;

    if (
        teammate === puckCarrier
    ) {
        return;
    }

    const carrierOnLeft =
        puckCarrier.body.x <
        rink.centerX;

    const teammateIsFarSide =
        (
            carrierOnLeft &&
            teammate.side === "right"
        ) ||
        (
            !carrierOnLeft &&
            teammate.side === "left"
        );

    if (
        teammateIsFarSide
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
        Phaser.Math.Angle.Wrap(
            currentAngle +
            Phaser.Math.Clamp(
                difference,
                -maximumTurn,
                maximumTurn
            )
        );

    teammate.facingX =
        Math.cos(
            newAngle
        );

    teammate.facingY =
        Math.sin(
            newAngle
        );
}

function updateTeammateVisuals(
    teammate
) {
    teammate.label.setPosition(
        Math.round(
            teammate.body.x
        ),
        Math.round(
            teammate.body.y - 19
        )
    );

    updateTeammateStick(
        teammate
    );
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
        Math.round(handX),
        Math.round(handY),
        Math.round(
            geometry.bladeStartX
        ),
        Math.round(
            geometry.bladeStartY
        )
    );

    state.playerStick.lineStyle(
        4,
        0x222222,
        1
    );

    state.playerStick.lineBetween(
        Math.round(
            geometry.bladeStartX
        ),
        Math.round(
            geometry.bladeStartY
        ),
        Math.round(
            geometry.bladeEndX
        ),
        Math.round(
            geometry.bladeEndY
        )
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
        Math.round(handX),
        Math.round(handY),
        Math.round(
            geometry.bladeStartX
        ),
        Math.round(
            geometry.bladeStartY
        )
    );

    teammate.stick.lineStyle(
        4,
        0x222222,
        1
    );

    teammate.stick.lineBetween(
        Math.round(
            geometry.bladeStartX
        ),
        Math.round(
            geometry.bladeStartY
        ),
        Math.round(
            geometry.bladeEndX
        ),
        Math.round(
            geometry.bladeEndY
        )
    );
}

/* =========================================================
   PUCK
========================================================= */

function createPuck(
    scene
) {
    const state =
        scene.gameState;

    state.puck =
        scene.add.circle(
            Math.round(
                state.rink.centerX
            ),
            Math.round(
                state.rink.centerY
            ),
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

function hardLockPossessedPuck(
    scene
) {
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

function checkForPuckPickup(
    scene
) {
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
            distance <= 23
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
            distance <= 23
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
function givePuckToPlayer(scene) {
    const state = scene.gameState;

    state.possession.owner = state.player;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    hardLockPossessedPuck(scene);
}

function givePuckToTeammate(
    scene,
    teammate
) {
    const state = scene.gameState;

    state.possession.owner = teammate;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;

    hardLockPossessedPuck(scene);
}

function releasePuck(
    scene,
    velocityX,
    velocityY
) {
    const state = scene.gameState;

    state.possession.owner = null;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;
    state.possession.pickupCooldown = 0.12;

    state.puckVelocityX = velocityX;
    state.puckVelocityY = velocityY;
}

function updateLoosePuck(
    scene,
    deltaSeconds
) {
    const state = scene.gameState;

    if (
        state.playStopped ||
        state.possession.owner
    ) {
        return;
    }

    state.puck.x +=
        state.puckVelocityX *
        deltaSeconds;

    state.puck.y +=
        state.puckVelocityY *
        deltaSeconds;

    state.puckVelocityX *=
        Math.pow(
            0.994,
            deltaSeconds * 60
        );

    state.puckVelocityY *=
        Math.pow(
            0.994,
            deltaSeconds * 60
        );

    const corrected =
        clampPointInsideRoundedRink(
            state.puck.x,
            state.puck.y,
            state.puckRadius,
            state.rink
        );

    if (corrected.hitX) {
        state.puckVelocityX *= -0.88;
    }

    if (corrected.hitY) {
        state.puckVelocityY *= -0.88;
    }

    state.puck.setPosition(
        corrected.x,
        corrected.y
    );

    checkGoal(scene);
    checkForPuckPickup(scene);
}

function playerShoot(scene) {
    const state = scene.gameState;

    if (
        state.playStopped ||
        state.possession.owner !==
            state.player
    ) {
        return;
    }

    const speed = 820;

    releasePuck(
        scene,
        state.facingX * speed,
        state.facingY * speed
    );
}

function playerPass(scene) {
    const state = scene.gameState;

    if (
        state.playStopped ||
        state.possession.owner !==
            state.player
    ) {
        return;
    }

    let bestTarget = null;
    let bestScore = -Infinity;

    for (const teammate of state.teammates) {

        const dx =
            teammate.body.x -
            state.player.x;

        const dy =
            teammate.body.y -
            state.player.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance > 320
        ) {
            continue;
        }

        const directionX =
            dx / distance;

        const directionY =
            dy / distance;

        const dot =
            directionX *
                state.facingX +
            directionY *
                state.facingY;

        const score =
            dot * 1000 -
            distance;

        if (
            score > bestScore
        ) {
            bestScore =
                score;

            bestTarget =
                teammate;
        }
    }

    if (!bestTarget) {
        playerShoot(scene);
        return;
    }

    const dx =
        bestTarget.body.x -
        state.player.x;

    const dy =
        bestTarget.body.y -
        state.player.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    const speed = 560;

    state.possession.passTarget =
        bestTarget;

    state.possession.passTargetType =
        "teammate";

    releasePuck(
        scene,
        (dx / distance) *
            speed,
        (dy / distance) *
            speed
    );
}

function updateAIPuckDecision(
    scene,
    teammate,
    deltaSeconds
) {
    const state = scene.gameState;

    teammate.decisionTimer -=
        deltaSeconds;

    if (
        teammate.decisionTimer >
        0
    ) {
        return;
    }

    teammate.decisionTimer =
        Phaser.Math.FloatBetween(
            0.35,
            0.7
        );

    const goalDistance =
        Phaser.Math.Distance.Between(
            teammate.body.x,
            teammate.body.y,
            state.offensiveGoal.x,
            state.offensiveGoal.y
        );

    if (
        goalDistance < 150
    ) {
        const dx =
            state.offensiveGoal.x -
            teammate.body.x;

        const dy =
            state.offensiveGoal.y -
            teammate.body.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        releasePuck(
            scene,
            (dx / distance) *
                760,
            (dy / distance) *
                760
        );

        return;
    }

    let teammateTarget =
        null;

    let bestDistance =
        Infinity;

    for (const other of state.teammates) {

        if (
            other === teammate
        ) {
            continue;
        }

        const distance =
            Phaser.Math.Distance.Between(
                teammate.body.x,
                teammate.body.y,
                other.body.x,
                other.body.y
            );

        if (
            distance <
            bestDistance
        ) {
            bestDistance =
                distance;

            teammateTarget =
                other;
        }
    }

    if (!teammateTarget) {
        return;
    }

    const dx =
        teammateTarget.body.x -
        teammate.body.x;

    const dy =
        teammateTarget.body.y -
        teammate.body.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    state.possession.passTarget =
        teammateTarget;

    state.possession.passTargetType =
        "teammate";

    releasePuck(
        scene,
        (dx / distance) *
            520,
        (dy / distance) *
            520
    );
}

function checkGoal(scene) {
    const state = scene.gameState;

    if (state.playStopped) {
        return;
    }

    const goal =
        state.offensiveGoal;

    if (
        Math.abs(
            state.puck.x -
                goal.x
        ) <
            goal.width / 2 &&
        state.puck.y <
            goal.y +
                goal.depth
    ) {
        state.score++;

        updateScoreboard(
            state
        );

        startFaceoff(
            scene
        );
    }
}

function startFaceoff(scene) {
    const state =
        scene.gameState;

    state.playStopped = true;

    state.faceoffTimer = 2.2;

    state.faceoffText
        .setText(
            "Faceoff at center ice"
        )
        .setVisible(true);

    state.goalText
        .setVisible(true);

    state.player.setPosition(
        state.rink.centerX,
        state.rink.centerY + 120
    );

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.facingX = 0;
    state.facingY = -1;

    const positions = [
        {
            x:
                state.rink.centerX -
                70,
            y:
                state.rink.centerY -
                170
        },
        {
            x:
                state.rink.centerX +
                70,
            y:
                state.rink.centerY -
                170
        }
    ];

    state.teammates.forEach(
        (
            teammate,
            index
        ) => {

            teammate.body.setPosition(
                positions[index].x,
                positions[index].y
            );

            teammate.velocityX = 0;
            teammate.velocityY = 0;
        }
    );

    state.puck.setPosition(
        state.player.x,
        state.player.y - 26
    );

    givePuckToPlayer(scene);
}
/* =========================================================
   MAIN GAME LOOP
========================================================= */

function update(time, delta) {
    const state = this.gameState;

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

    if (state.playStopped) {
        updateFaceoffTimer(
            this,
            deltaSeconds
        );

        updatePlayerStick(this);

        for (
            const teammate
            of state.teammates
        ) {
            updateTeammateStick(
                teammate
            );

            updateTeammateLabel(
                teammate
            );
        }

        hardLockPossessedPuck(
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
        updateLoosePuck(
            this,
            deltaSeconds
        );
    }

    if (
        state.possession.owner
    ) {
        hardLockPossessedPuck(
            this
        );
    }

    updateAimGuide(
        this
    );

    updatePassCallVisuals(
        this
    );

    updateTeammateIndicators(
        this
    );
}

/* =========================================================
   FACEOFF TIMER
========================================================= */

function updateFaceoffTimer(
    scene,
    deltaSeconds
) {
    const state =
        scene.gameState;

    if (!state.playStopped) {
        return;
    }

    state.faceoffTimer -=
        deltaSeconds;

    if (
        state.faceoffTimer > 0
    ) {
        return;
    }

    finishFaceoff(
        scene
    );
}

function finishFaceoff(scene) {
    const state =
        scene.gameState;

    state.playStopped = false;
    state.faceoffTimer = 0;

    if (state.goalText) {
        state.goalText
            .setVisible(false);
    }

    if (state.faceoffText) {
        state.faceoffText
            .setVisible(false);
    }

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.movement.directionX = 0;
    state.movement.directionY = 0;
    state.movement.strength = 0;

    state.sprinting = false;

    if (
        typeof updateSprintButtonAppearance ===
        "function"
    ) {
        updateSprintButtonAppearance(
            scene
        );
    }

    for (
        const teammate
        of state.teammates
    ) {
        teammate.velocityX = 0;
        teammate.velocityY = 0;

        teammate.decisionTimer =
            Phaser.Math.FloatBetween(
                0.65,
                1.1
            );
    }

    /*
     * The controlled player begins every
     * restart with the puck attached firmly
     * to the stick blade.
     */
    givePuckToPlayer(
        scene
    );

    updatePlayerStick(
        scene
    );

    hardLockPossessedPuck(
        scene
    );
}

/* =========================================================
   SCOREBOARD
========================================================= */

function updateScoreboard(state) {
    if (
        !state ||
        !state.scoreText
    ) {
        return;
    }

    state.scoreText.setText(
        `GOALS  ${state.score}`
    );
}

function createCompactScoreboard(
    scene
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    /*
     * Small scoreboard placed beside the
     * upper boards instead of covering
     * the goal or center of play.
     */
    state.scoreboardBackground =
        scene.add.rectangle(
            rink.right - 51,
            rink.top + 67,
            88,
            28,
            0x132b45,
            0.9
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(145);

    state.scoreText =
        scene.add.text(
            rink.right - 51,
            rink.top + 67,
            "GOALS  0",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "12px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                resolution:
                    3
            }
        )
            .setOrigin(0.5)
            .setDepth(146);

    updateScoreboard(
        state
    );
}

/* =========================================================
   GOAL AND FACEOFF TEXT
========================================================= */

function createGoalMessages(
    scene
) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    state.goalText =
        scene.add.text(
            rink.centerX,
            rink.centerY - 35,
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
                    "#b40000",

                strokeThickness:
                    8,

                resolution:
                    3
            }
        )
            .setOrigin(0.5)
            .setDepth(180)
            .setVisible(false);

    state.faceoffText =
        scene.add.text(
            rink.centerX,
            rink.centerY + 16,
            "Faceoff at center ice",
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
                    "#17375e",

                padding: {
                    left: 9,
                    right: 9,
                    top: 4,
                    bottom: 4
                },

                resolution:
                    3
            }
        )
            .setOrigin(0.5)
            .setDepth(180)
            .setVisible(false);
}

/* =========================================================
   RED GOAL LIGHTS
========================================================= */

function createGoalLights(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    state.topGoalLight =
        scene.add.circle(
            rink.centerX,
            rink.top + 10,
            7,
            0x5c1010,
            1
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(15);

    state.bottomGoalLight =
        scene.add.circle(
            rink.centerX,
            rink.bottom - 10,
            7,
            0x5c1010,
            1
        )
            .setStrokeStyle(
                2,
                0xffffff,
                0.9
            )
            .setDepth(15);
}

function flashGoalLight(
    scene,
    side = "top"
) {
    const state =
        scene.gameState;

    const light =
        side === "bottom"
            ? state.bottomGoalLight
            : state.topGoalLight;

    if (!light) {
        return;
    }

    scene.tweens.killTweensOf(
        light
    );

    light
        .setFillStyle(
            0xff1111,
            1
        )
        .setAlpha(1)
        .setScale(1);

    scene.tweens.add({
        targets: light,

        alpha: {
            from: 1,
            to: 0.2
        },

        scaleX: {
            from: 1,
            to: 1.7
        },

        scaleY: {
            from: 1,
            to: 1.7
        },

        duration: 170,
        yoyo: true,
        repeat: 5,

        onComplete: () => {
            light
                .setFillStyle(
                    0x5c1010,
                    1
                )
                .setAlpha(1)
                .setScale(1);
        }
    });
}

/* =========================================================
   UPDATED GOAL CHECK
========================================================= */

function checkGoal(scene) {
    const state =
        scene.gameState;

    if (
        state.playStopped ||
        state.possession.owner
    ) {
        return;
    }

    const geometry =
        getGoalGeometry(
            state
        );

    const puck =
        state.puck;

    const leftInsidePost =
        state.rink.centerX -
        geometry.mouthHalfWidth +
        state.puckRadius;

    const rightInsidePost =
        state.rink.centerX +
        geometry.mouthHalfWidth -
        state.puckRadius;

    const insideGoalWidth =
        puck.x >= leftInsidePost &&
        puck.x <= rightInsidePost;

    if (!insideGoalWidth) {
        return;
    }

    const enteredTopGoal =
        puck.y <=
        geometry.topLineY - 2;

    if (!enteredTopGoal) {
        return;
    }

    state.score += 1;

    updateScoreboard(
        state
    );

    flashGoalLight(
        scene,
        "top"
    );

    scene.cameras.main.flash(
        120,
        255,
        45,
        45,
        false
    );

    startFaceoff(
        scene
    );
}

/* =========================================================
   TEAMMATE LABELS AND VISUAL REFRESH
========================================================= */

function updateTeammateLabel(
    teammate
) {
    if (!teammate.label) {
        return;
    }

    teammate.label.setPosition(
        Math.round(
            teammate.body.x
        ),

        Math.round(
            teammate.body.y - 19
        )
    );
}

function updateAllPlayerVisuals(
    scene
) {
    const state =
        scene.gameState;

    if (!state.player) {
        return;
    }

    state.player.setPosition(
        Math.round(
            state.player.x * 2
        ) / 2,

        Math.round(
            state.player.y * 2
        ) / 2
    );

    updatePlayerStick(
        scene
    );

    for (
        const teammate
        of state.teammates
    ) {
        teammate.body.setPosition(
            Math.round(
                teammate.body.x * 2
            ) / 2,

            Math.round(
                teammate.body.y * 2
            ) / 2
        );

        updateTeammateLabel(
            teammate
        );

        updateTeammateStick(
            teammate
        );
    }

    if (
        state.possession.owner
    ) {
        hardLockPossessedPuck(
            scene
        );
    }
}

/* =========================================================
   SHARP GRAPHICS SETTINGS
========================================================= */

function applySharpRendering(scene) {
    const renderer =
        scene.game.renderer;

    if (
        renderer &&
        renderer.gl
    ) {
        renderer.gl.disable(
            renderer.gl.DITHER
        );
    }

    scene.cameras.main
        .setRoundPixels(true);

    scene.cameras.main
        .setZoom(1);

    /*
     * Higher text resolution prevents fuzzy
     * labels on Retina and high-density phones.
     */
    const textObjects = [
        scene.gameState.scoreText,
        scene.gameState.goalText,
        scene.gameState.faceoffText
    ];

    for (
        const textObject
        of textObjects
    ) {
        if (
            textObject &&
            textObject.setResolution
        ) {
            textObject.setResolution(
                Math.max(
                    2,
                    window.devicePixelRatio ||
                    1
                )
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
            rink.bottom - 83,
            scene.scale.height - 138
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

    createPassCallButton(
        scene,
        rink.left + 60,
        controlsY - 77
    );

    createSprintButton(
        scene,
        rink.right - 60,
        controlsY - 77
    );
}

/* =========================================================
   MOVEMENT JOYSTICK
========================================================= */

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
            0.8
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

    movement.hitArea =
        scene.add.circle(
            x,
            y,
            movement.baseRadius + 18,
            0xffffff,
            0.001
        )
            .setDepth(103)
            .setInteractive({
                useHandCursor: true
            });

    movement.hitArea.on(
        "pointerdown",
        pointer => {
            const state =
                scene.gameState;

            if (
                state.playStopped ||
                movement.active
            ) {
                return;
            }

            movement.active = true;

            movement.pointerId =
                pointer.id;

            movement.base.setFillStyle(
                0x285b91,
                0.92
            );

            updateMovementFromPointer(
                scene,
                pointer
            );
        }
    );
}

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
        Math.round(
            movement.centerX +
            directionX *
                clampedDistance
        ),

        Math.round(
            movement.centerY +
            directionY *
                clampedDistance
        )
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
            0.8
        );
    }
}

/* =========================================================
   SHOOT / PASS JOYSTICK
========================================================= */

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
            0.82
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
            "SHOOT/\nPASS",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "8px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                align:
                    "center",

                lineSpacing:
                    -2,

                resolution:
                    3
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

    aim.hitArea =
        scene.add.circle(
            x,
            y,
            aim.baseRadius + 18,
            0xffffff,
            0.001
        )
            .setDepth(103)
            .setInteractive({
                useHandCursor: true
            });

    aim.hitArea.on(
        "pointerdown",
        pointer => {
            const state =
                scene.gameState;

            if (
                state.playStopped ||
                aim.active
            ) {
                return;
            }

            aim.active = true;

            aim.pointerId =
                pointer.id;

            aim.base.setFillStyle(
                0xb62b2b,
                0.95
            );

            updateAimFromPointer(
                scene,
                pointer
            );
        }
    );
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
        Math.round(
            aim.centerX +
            directionX *
                clampedDistance
        );

    const knobY =
        Math.round(
            aim.centerY +
            directionY *
                clampedDistance
        );

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
    shouldUseControl
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

    if (
        shouldUseControl &&
        !state.playStopped &&
        aim.strength > 0.08
    ) {
        useShotControl(
            scene
        );
    }

    resetAimJoystick(
        scene
    );
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
            0.82
        );
    }

    if (aim.guide) {
        aim.guide.clear();
    }

    if (aim.powerBar) {
        aim.powerBar.clear();
    }
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
            102,
            36,
            0x1769d2,
            0.96
        )
            .setStrokeStyle(
                2,
                0xffffff,
                1
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
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "11px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                resolution:
                    3
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

    if (!state.sprintButton) {
        return;
    }

    if (state.sprinting) {
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
                0.96
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
   CALL FOR PASS BUTTON
========================================================= */

function createPassCallButton(
    scene,
    x,
    y
) {
    const state =
        scene.gameState;

    const passCall =
        state.passCall;

    passCall.button =
        scene.add.rectangle(
            x,
            y,
            102,
            36,
            0x2477c9,
            0.98
        )
            .setStrokeStyle(
                2,
                0xffffff,
                1
            )
            .setDepth(110)
            .setInteractive({
                useHandCursor: true
            });

    passCall.label =
        scene.add.text(
            x,
            y,
            "CALL PASS",
            {
                fontFamily:
                    "Arial, sans-serif",

                fontSize:
                    "11px",

                fontStyle:
                    "bold",

                color:
                    "#ffffff",

                resolution:
                    3
            }
        )
            .setOrigin(0.5)
            .setDepth(111)
            .setInteractive({
                useHandCursor: true
            });

    const activatePassCall = (
        pointer,
        localX,
        localY,
        event
    ) => {
        requestPass(
            scene
        );

        if (
            event &&
            event.stopPropagation
        ) {
            event.stopPropagation();
        }
    };

    passCall.button.on(
        "pointerdown",
        activatePassCall
    );

    passCall.label.on(
        "pointerdown",
        activatePassCall
    );
}

function createPassCallVisuals(scene) {
    const state =
        scene.gameState;

    if (!state.passCall.ring) {
        state.passCall.ring =
            scene.add.graphics()
                .setDepth(25);
    }

    if (!state.passCall.text) {
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
                    },

                    resolution:
                        3
                }
            )
                .setOrigin(0.5)
                .setDepth(26)
                .setVisible(false);
    }
}

function requestPass(scene) {
    const state =
        scene.gameState;

    const passCall =
        state.passCall;

    if (
        state.playStopped ||
        passCall.cooldown > 0
    ) {
        return;
    }

    const puckCarrier =
        state.possession.owner;

    if (
        !puckCarrier ||
        puckCarrier === state.player
    ) {
        passCall.cooldown = 0.35;

        flashPassCallUnavailable(
            scene
        );

        return;
    }

    passCall.active = true;

    passCall.cooldown =
        passCall.cooldownLength;

    passCall.displayTimer = 0.85;

    const playerGeometry =
        getPlayerStickGeometry(
            state
        );

    const carrierGeometry =
        getTeammateStickGeometry(
            puckCarrier
        );

    const distance =
        Phaser.Math.Distance.Between(
            carrierGeometry.puckAnchorX,
            carrierGeometry.puckAnchorY,
            playerGeometry.puckAnchorX,
            playerGeometry.puckAnchorY
        );

    const distanceToGoal =
        Phaser.Math.Distance.Between(
            puckCarrier.body.x,
            puckCarrier.body.y,
            state.offensiveGoal.x,
            state.offensiveGoal.y
        );

    let passChance = 0.76;

    if (
        state.player.y <
        puckCarrier.body.y
    ) {
        passChance += 0.1;
    }

    if (distance < 175) {
        passChance += 0.08;
    }

    if (distance > 235) {
        passChance -= 0.2;
    }

    if (distanceToGoal < 85) {
        passChance -= 0.48;
    } else if (
        distanceToGoal < 120
    ) {
        passChance -= 0.24;
    }

    passChance =
        Phaser.Math.Clamp(
            passChance,
            0.18,
            0.95
        );

    const playerInRange =
        distance >= 38 &&
        distance <= 275;

    if (
        playerInRange &&
        Math.random() <
            passChance
    ) {
        passFromTeammate(
            scene,
            puckCarrier,
            {
                type: "player",
                target: state.player
            }
        );

        return;
    }

    puckCarrier.decisionTimer =
        Math.min(
            puckCarrier.decisionTimer,
            0.1
        );
}

function updatePassCallState(
    scene,
    deltaSeconds
) {
    const passCall =
        scene.gameState.passCall;

    passCall.cooldown =
        Math.max(
            0,
            passCall.cooldown -
                deltaSeconds
        );

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
        !passCall.button ||
        !passCall.label
    ) {
        return;
    }

    const teammateHasPuck =
        state.possession.owner &&
        state.possession.owner !==
            state.player;

    const buttonAvailable =
        !state.playStopped &&
        teammateHasPuck &&
        passCall.cooldown <= 0;

    if (buttonAvailable) {
        passCall.button
            .setFillStyle(
                0x2477c9,
                0.98
            )
            .setAlpha(1);

        passCall.label
            .setText(
                "CALL PASS"
            )
            .setAlpha(1);
    } else if (
        passCall.cooldown > 0
    ) {
        passCall.button
            .setFillStyle(
                0x495e73,
                0.88
            )
            .setAlpha(0.9);

        passCall.label
            .setText(
                "WAIT"
            )
            .setAlpha(0.9);
    } else {
        passCall.button
            .setFillStyle(
                0x495e73,
                0.75
            )
            .setAlpha(0.8);

        passCall.label
            .setText(
                "CALL PASS"
            )
            .setAlpha(0.8);
    }

    if (passCall.ring) {
        passCall.ring.clear();
    }

    if (passCall.text) {
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
            scene.time.now *
                0.018
        ) *
        0.16;

    passCall.ring.lineStyle(
        3,
        0x28e7ff,
        0.96
    );

    passCall.ring.strokeCircle(
        Math.round(
            state.player.x
        ),

        Math.round(
            state.player.y
        ),

        18 * pulse
    );

    passCall.text
        .setPosition(
            Math.round(
                state.player.x
            ),

            Math.round(
                state.player.y - 35
            )
        )
        .setVisible(true);
}

function flashPassCallUnavailable(scene) {
    const passCall =
        scene.gameState.passCall;

    if (
        !passCall.button ||
        !passCall.label
    ) {
        return;
    }

    passCall.label.setText(
        "NO PUCK"
    );

    passCall.button.setFillStyle(
        0x8f2020,
        0.98
    );

    scene.time.delayedCall(
        320,
        () => {
            updatePassCallVisuals(
                scene
            );
        }
    );
}

/* =========================================================
   KEYBOARD INPUT
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

                    space:
                        Phaser.Input.Keyboard
                            .KeyCodes.SPACE,

                    shift:
                        Phaser.Input.Keyboard
                            .KeyCodes.SHIFT,

                    callPass:
                        Phaser.Input.Keyboard
                            .KeyCodes.C
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

    if (
        state.playStopped ||
        !keyboard
    ) {
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
        keyboard.shift &&
        Phaser.Input.Keyboard
            .JustDown(
                keyboard.shift
            )
    ) {
        state.sprinting =
            !state.sprinting;

        updateSprintButtonAppearance(
            scene
        );
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

    if (
        Phaser.Input.Keyboard
            .JustDown(
                keyboard.callPass
            )
    ) {
        requestPass(
            scene
        );
    }
}

/* =========================================================
   POINTER CLEANUP
========================================================= */

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
   FACEOFF RESET
========================================================= */

function startFaceoff(scene) {
    const state =
        scene.gameState;

    const rink =
        state.rink;

    if (state.playStopped) {
        return;
    }

    state.playStopped = true;
    state.faceoffTimer = 2.15;

    state.possession.owner = null;
    state.possession.passTarget = null;
    state.possession.passTargetType = null;
    state.possession.pickupCooldown = 999;

    state.puckVelocityX = 0;
    state.puckVelocityY = 0;

    state.playerVelocityX = 0;
    state.playerVelocityY = 0;

    state.passCall.active = false;
    state.passCall.cooldown = 0;
    state.passCall.displayTimer = 0;

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

    state.player.setPosition(
        rink.centerX,
        rink.centerY + 72
    );

    state.facingAngle =
        -Math.PI / 2;

    state.targetFacingAngle =
        -Math.PI / 2;

    state.facingX = 0;
    state.facingY = -1;

    const restartPositions = [
        {
            x:
                rink.centerX - 70,

            y:
                rink.centerY + 28
        },
        {
            x:
                rink.centerX + 70,

            y:
                rink.centerY + 28
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
            restartPositions[index] ||
            restartPositions[0];

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

        updateTeammateLabel(
            teammate
        );

        updateTeammateStick(
            teammate
        );
    }

    state.puck.setPosition(
        rink.centerX,
        rink.centerY
    );

    if (state.goalText) {
        state.goalText
            .setVisible(true)
            .setAlpha(1)
            .setScale(0.7);

        scene.tweens.killTweensOf(
            state.goalText
        );

        scene.tweens.add({
            targets:
                state.goalText,

            scaleX: 1.12,
            scaleY: 1.12,

            duration: 220,

            ease:
                "Back.Out",

            yoyo: true
        });
    }

    if (state.faceoffText) {
        state.faceoffText
            .setVisible(true);
    }

    updatePlayerStick(
        scene
    );

    updatePassCallVisuals(
        scene
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

/* =========================================================
   GENERAL GEOMETRY HELPERS
========================================================= */

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
   FINAL DISPLAY SETUP
========================================================= */

function completeDisplaySetup(scene) {
    const state =
        scene.gameState;

    createCompactScoreboard(
        scene
    );

    createGoalMessages(
        scene
    );

    createGoalLights(
        scene
    );

    createPassCallVisuals(
        scene
    );

    applySharpRendering(
        scene
    );

    updateAllPlayerVisuals(
        scene
    );

    updatePassCallVisuals(
        scene
    );

    if (
        state.scoreboardBackground
    ) {
        state.scoreboardBackground
            .setVisible(true);
    }

    if (state.scoreText) {
        state.scoreText
            .setVisible(true);
    }
}