import BaseScene from './BaseScene';

class PauseScene extends BaseScene {
    constructor(config) {
        super('PauseScene', config);

        this.menu = [
            { scene: 'PlayScene', text: 'Continue' },
            { scene: 'MenuScene', text: 'Exit' }
        ];
    }

    create() {
        super.create();

        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on('pointerover', () => {
            textGO.setStyle({ fill: '#FF0' });
        });

        textGO.on('pointerout', () => {
            textGO.setStyle({ fill: '#FFF' });
        });

        textGO.on('pointerup', () => {
            if (menuItem.scene && menuItem.text === 'Continue') {
                // Shutting down PauseScene and resume PlayScene
                this.scene.stop();
                this.scene.resume(menuItem.scene);
            }
            else {
                // Shutting down PlayScene, PauseScene and running Menu
                this.scene.stop('PlayScene');
                this.scene.start(menuItem.scene);
            }
        });
    }
}

export default PauseScene;
