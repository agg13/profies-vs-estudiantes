class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
    this.storyIndex = 0;
    this.transitioning = false;
  }

  create() {
    MusicService.stop(this);
    this.cameras.main.setBackgroundColor('#07111f');
    this.cameras.main.fadeIn(450, 7, 17, 31);

    this.add.rectangle(480, 270, 960, 540, 0x07111f);
    this.add.circle(120, 110, 90, 0x1d4ed8, 0.2);
    this.add.circle(820, 430, 140, 0x7e22ce, 0.18);

    this.title = this.add.text(480, 135, 'LA ÚLTIMA ASESORÍA MORTAL', {
      fontFamily: 'Arial Black, Arial', fontSize: '42px', color: '#f8fafc',
      align: 'center', stroke: '#7e22ce', strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    this.subtitle = this.add.text(480, 195, 'PROFESORES ZOMBIS', {
      fontFamily: 'Arial Black, Arial', fontSize: '31px', color: '#facc15'
    }).setOrigin(0.5).setAlpha(0);

    this.storyText = this.add.text(480, 315, '', {
      fontFamily: 'Arial', fontSize: '24px', color: '#e2e8f0',
      align: 'center', wordWrap: { width: 760 }, lineSpacing: 7
    }).setOrigin(0.5);

    this.continueButton = this.add.text(480, 465, 'CONTINUAR  [ESPACIO]', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#0f172a',
      backgroundColor: '#facc15', padding: { x: 24, y: 13 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.continueButton.on('pointerover', () => this.continueButton.setScale(1.04));
    this.continueButton.on('pointerout', () => this.continueButton.setScale(1));
    this.continueButton.on('pointerdown', () => this.advanceStory());

    this.add.text(480, 510, 'La introducción puede avanzarse en cualquier momento', {
      fontFamily: 'Arial', fontSize: '15px', color: '#94a3b8'
    }).setOrigin(0.5);

    this.story = [
      'Un nuevo periodo comienza en la Universidad YCT.\nUna actualización libera el Virus de Sobrecarga Académica.',
      'Los profesores infectados se convierten en Profies\ny bloquean los lugares más importantes del campus.',
      'Explora, ayuda a otros estudiantes y demuestra lo que sabes.\nTu conocimiento es la única forma de restaurar la universidad.'
    ];

    this.tweens.add({
      targets: [this.title, this.subtitle], alpha: 1, duration: 650,
      ease: 'Sine.easeOut', onComplete: () => this.showStoryLine()
    });
    this.input.keyboard.on('keydown-SPACE', () => this.advanceStory());
  }

  showStoryLine() {
    if (this.storyIndex >= this.story.length) {
      this.storyText.setText('El campus te necesita. ¿Estás listo?').setAlpha(1);
      this.continueButton.setText('COMENZAR  [ESPACIO]');
      return;
    }
    this.storyText.setAlpha(0).setText(this.story[this.storyIndex]);
    this.tweens.add({
      targets: this.storyText, alpha: 1, duration: 260, ease: 'Sine.easeOut'
    });
  }

  advanceStory() {
    if (this.transitioning) return;
    RetroAudio.beep();
    if (this.storyIndex >= this.story.length) {
      this.startGame();
      return;
    }
    this.storyIndex += 1;
    this.showStoryLine();
  }

  startGame() {
    this.transitioning = true;
    const nextScene = GAME_STATE.playerName && GAME_STATE.career ? 'MapScene' : 'NameScene';
    this.cameras.main.fadeOut(350, 7, 17, 31);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(nextScene));
  }
}
