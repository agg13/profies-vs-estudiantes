class OutcomeScene extends Phaser.Scene {
  constructor() {
    super('OutcomeScene');
  }

  init(data) {
    this.outcome = data.outcome === 'victory' ? 'victory' : 'defeat';
  }

  create() {
    MusicService.stop(this, 250);
    const victory = this.outcome === 'victory';
    this.cameras.main.setBackgroundColor(victory ? '#052e2b' : '#260b16');
    this.cameras.main.fadeIn(500, 5, 46, 43);
    this.add.rectangle(480, 270, 880, 470, victory ? 0x064e3b : 0x450a0a)
      .setStrokeStyle(5, victory ? 0xfacc15 : 0xf87171);

    this.add.text(480, 70, victory ? '¡CAMPUS LIBERADO!' : 'FIN DE LA PARTIDA', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '38px',
      color: victory ? '#fde047' : '#fca5a5'
    }).setOrigin(0.5);

    const message = victory
      ? `${GAME_STATE.playerName} completó el antídoto y liberó a los tres Profies.\nLa Universidad YCT puede volver a sus asesorías... por ahora.`
      : 'Se agotaron tus oportunidades. El avance posterior a tu último\nencuentro con el Vigilante no quedó guardado.';
    this.add.text(480, 145, message, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    const career = getSelectedCareer()?.shortName || 'Sin carrera';
    const summary = [
      `Carrera: ${career}`,
      `Avatar: ${getSelectedAvatar().shortName}`,
      `Puntos académicos: ${GAME_STATE.academicPoints}`,
      `Profies liberados: ${GAME_STATE.defeatedEnemies.length}/3`,
      `Misiones completadas: ${GAME_STATE.completedQuests.length}`,
      `Objetos encontrados: ${GAME_STATE.collectedItems.length}`
    ].join('\n');
    this.add.text(480, 265, summary, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#e2e8f0',
      align: 'left',
      lineSpacing: 7
    }).setOrigin(0.5);

    if (victory) {
      this.add.text(
        480,
        382,
        'Programar, diseñar y resolver problemas también puede convertirse en tu carrera.\n¿Te gustaría crear tu propio videojuego o aplicación?',
        {
          fontFamily: 'Arial', fontSize: '17px', color: '#bae6fd',
          align: 'center', lineSpacing: 5, wordWrap: { width: 790 }
        }
      ).setOrigin(0.5);
    }

    if (victory) {
      RetroAudio.victory();
      this.createButton(300, 455, 'VOLVER AL CAMPUS', 0x0ea5e9, () => {
        this.transitionToScene('MapScene');
      });
      this.createButton(660, 455, 'NUEVA PARTIDA', 0xf59e0b, () => {
        if (!window.confirm('¿Deseas borrar el guardado y comenzar una partida nueva?')) return;
        SaveService.newGame();
        this.transitionToScene('NameScene', { forceRegistration: true });
      });
      return;
    }

    RetroAudio.alert();
    const canLoad = SaveService.hasSave();
    this.createButton(300, 455, canLoad ? 'CARGAR GUARDADO' : 'SIN GUARDADO', canLoad ? 0x22c55e : 0x64748b, () => {
      if (!canLoad) return;
      if (SaveService.load()) this.transitionToScene('MapScene');
    });
    this.createButton(660, 455, 'NUEVA PARTIDA', 0xf59e0b, () => {
      if (!window.confirm('¿Deseas borrar el guardado y comenzar una partida nueva?')) return;
      SaveService.newGame();
      this.transitionToScene('NameScene', { forceRegistration: true });
    });
  }

  createButton(x, y, label, color, action) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
      color: '#0f172a',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 20, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setAlpha(0.82));
    button.on('pointerout', () => button.setAlpha(1));
    button.on('pointerdown', action);
  }

  transitionToScene(sceneKey, data) {
    this.cameras.main.fadeOut(350, 5, 46, 43);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneKey, data));
  }
}
