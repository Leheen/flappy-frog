import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    // Loading assets: images, music, animations...
    preload() {
        this.load.image('background', 'assets/sky.png');
        this.load.spritesheet('player', 'assets/frog.png', { frameWidth: 12, frameHeight: 16 });
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.image('back', 'assets/back.png');
    }

    create() {
        this.scene.start('MenuScene');
    }
}

export default PreloadScene;
