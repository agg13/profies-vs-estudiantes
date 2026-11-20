const technicalStatus = document.querySelector('#technical-status');

if (typeof Phaser === 'undefined') {
  technicalStatus.textContent = 'Error: no se encontró vendor/phaser.min.js';
  throw new Error('Phaser no está disponible. Revisa vendor/phaser.min.js');
}

technicalStatus.textContent = `Phaser ${Phaser.VERSION} cargado correctamente`;

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#0f172a',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, IntroScene, NameScene, MapScene, BattleScene, OutcomeScene]
};

new Phaser.Game(GAME_CONFIG);

