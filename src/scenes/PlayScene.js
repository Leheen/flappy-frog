import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);

        this.player = null;
        this.pipes = null;
        this.isPaused = false;

        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = '';

        this.currentDifficulty = 'easy';
        this.difficulties = {
            'easy': {
                pipeHorizontalDistanceRange: [300, 350],
                pipeVerticalDistanceRange: [150, 200]
            },
            'normal': {
                pipeHorizontalDistanceRange: [280, 330],
                pipeVerticalDistanceRange: [140, 190]
            },
            'hard': {
                pipeHorizontalDistanceRange: [250, 310],
                pipeVerticalDistanceRange: [120, 170]
            },
        }
    }

    create() {
        super.create();
        this.currentDifficulty = 'easy';
        this.createPlayer();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
        this.listenToEvents();

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 8, // 24 FPS default, 24 frames in 1 second
            repeat: -1 // Repeat infinitely
        });
        this.player.play('fly');
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    listenToEvents() {
        if (this.pauseEvent) return;
        this.pauseEvent = this.events.on('resume', () => {
            if (this.timedEvent) {
                this.timedEvent.remove();
                this.countdownText.setText('');
            }
            this.initialTime = 3;
            this.countdownText = this.add.text(...this.screenCenter, `Fly in ${this.initialTime}`, this.fontOptions).setOrigin(0.5);
            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countdown,
                callbackScope: this,
                loop: true,
            })
        });
    }

    countdown() {
        this.initialTime--;
        this.countdownText.setText(`Fly in ${this.initialTime}`);
        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countdownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'player')
            .setFlipX(true)
            .setScale(3)
            .setOrigin(0);
        this.player.setBodySize(this.player.width - 2, this.player.height - 6);
        this.player.body.gravity.y = 400;
        this.player.setCollideWorldBounds(true);
    }

    createPipes() {
        this.pipes = this.physics.add.group();
        for (let i = 0; i < PIPES_TO_RENDER; i++) {
            const upperPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 1);
            const lowerPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 0);

            this.placePipe(upperPipe, lowerPipe);
        }
        this.pipes.setVelocityX(-200);
    }

    createColliders() {
        this.physics.add.collider(this.player, this.pipes, this.gameOver, null, this);
    }

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#FFF' });
        this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#FFF' })
    }

    createPause() {
        this.isPaused = false;
        const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause').setInteractive().setScale(3).setOrigin(1);

        pauseButton.on('pointerdown', () => {
            this.pause();
        })
    }

    pause() {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown-SPACE', this.flap, this);
        this.input.keyboard.on('keydown-ESC', this.pause, this);
    }

    checkGameStatus() {
        if (this.player.getBounds().bottom >= this.config.height || this.player.y <= 0) {
            this.gameOver();
        }
    }

    placePipe(upperPipe, lowerPipe) {
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostX = this.getRightMostPipe();
        const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
        const pipeVerticalPosition = Phaser.Math.Between(0, this.config.height - 20 - pipeVerticalDistance);
        const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange)

        upperPipe.x = rightMostX + pipeHorizontalDistance;
        upperPipe.y = pipeVerticalPosition;

        lowerPipe.x = upperPipe.x;
        lowerPipe.y = upperPipe.y + pipeVerticalDistance;
    }

    recyclePipes() {
        const tempPipes = [];
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right <= 0) {
                tempPipes.push(pipe);
                if (tempPipes.length === 2) {
                    this.placePipe(...tempPipes);
                    this.increaseScore();
                    this.saveBestScore();
                    this.increaseDifficulty();
                }
            }
        });
    }

    increaseDifficulty() {
        if (this.score === 5) {
            this.currentDifficulty = 'normal';
        }

        if (this.score === 10) {
            this.currentDifficulty = 'hard';
        }
    }

    getRightMostPipe() {
        let rightMostX = 0;
        this.pipes.getChildren().forEach(pipe => {
            rightMostX = Math.max(pipe.x, rightMostX);
        });

        return rightMostX;
    }

    saveBestScore() {
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    }

    gameOver() {
        this.physics.pause();
        this.player.setTint(0xEE4824);

        this.saveBestScore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false
        })
    }

    flap() {
        if (this.isPaused) return;
        this.player.body.velocity.y = -this.flapVelocity;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

export default PlayScene;
