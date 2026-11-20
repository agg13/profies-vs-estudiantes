class NameScene extends Phaser.Scene {
  constructor() {
    super('NameScene');
  }

  init(data) {
    this.forceRegistration = Boolean(data.forceRegistration);
    this.selectedCareer = data.selectedCareer || '';
  }

  create() {
    MusicService.stop(this);
    this.cameras.main.setBackgroundColor('#1e293b');
    this.cameras.main.fadeIn(400, 30, 41, 59);
    this.add.rectangle(480, 270, 820, 410, 0x0f172a)
      .setStrokeStyle(4, 0xfacc15);
    const guard = this.add.image(230, 285, 'vigilante');
    const guardHeight = 300;
    guard.setDisplaySize(guard.width * guardHeight / guard.height, guardHeight);
    this.add.text(390, 105, 'Entrada de la Universidad YCT', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: '#f8fafc'
    });

    // DONE SEMANA 2.3A: selección entre guardado existente y registro nuevo.
    if (SaveService.hasSave() && !this.forceRegistration) {
      this.createSavedGameMenu();
    } else if (CAREER_CATALOG[this.selectedCareer]) {
      this.createAvatarSelectionMenu();
    } else {
      this.createRegistrationMenu();
    }
  }

  createSavedGameMenu() {
    this.add.text(
      390,
      180,
      'Vigilante:\nEncontré una partida guardada.\n¿Quieres continuar o comenzar nuevamente?',
      {
        fontFamily: 'Arial',
        fontSize: '23px',
        color: '#e2e8f0',
        lineSpacing: 10,
        wordWrap: { width: 440 }
      }
    );

    this.createButton(560, 350, 'CONTINUAR PARTIDA', 0x22c55e, () => {
      // DONE SEMANA 2.3B: cargar y continuar; limpiar si el dato está dañado.
      RetroAudio.confirm();
      if (SaveService.load()) this.transitionToScene('MapScene');
      else {
        RetroAudio.alert();
        SaveService.clear();
        this.scene.restart({ forceRegistration: true });
      }
    });

    this.createButton(560, 420, 'NUEVA PARTIDA', 0xf59e0b, () => {
      // DONE SEMANA 2.3C: confirmación antes de borrar el progreso.
      const accepted = window.confirm(
        'La nueva partida eliminará el guardado anterior. ¿Deseas continuar?'
      );
      if (!accepted) return;
      RetroAudio.alert();
      SaveService.newGame();
      this.scene.restart({ forceRegistration: true });
    });
  }

  createRegistrationMenu() {
    this.add.text(
      390,
      170,
      'Vigilante:\nPrimero selecciona tu carrera. Después elegirás tu avatar y registraré tu nombre.\nLa carrera determinará tus retos académicos.',
      {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#e2e8f0',
        lineSpacing: 8,
        wordWrap: { width: 440 }
      }
    );

    this.add.text(560, 300, 'PASO 1 · SELECCIONA TU CARRERA', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '19px',
      color: '#facc15'
    }).setOrigin(0.5);

    this.createButton(560, 355, 'INGENIERÍA INDUSTRIAL', 0xfacc15, () => {
      this.scene.restart({ forceRegistration: true, selectedCareer: 'industrial' });
    });
    this.createButton(560, 425, 'SISTEMAS Y TECNOLOGÍAS', 0xfacc15, () => {
      this.scene.restart({ forceRegistration: true, selectedCareer: 'sistemas' });
    });
  }

  createAvatarSelectionMenu() {
    this.add.text(560, 120, 'PASO 2 · ELIGE TU AVATAR', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '21px',
      color: '#facc15'
    }).setOrigin(0.5);

    this.add.text(560, 154, `Carrera: ${CAREER_CATALOG[this.selectedCareer].shortName}`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#cbd5e1'
    }).setOrigin(0.5);

    this.createAvatarOption(475, 'masculino');
    this.createAvatarOption(650, 'femenino');
  }

  createAvatarOption(x, avatarId) {
    const avatar = AVATAR_CATALOG[avatarId];
    const card = this.add.rectangle(x, 282, 150, 210, 0x172554, 0.9)
      .setStrokeStyle(3, 0x38bdf8)
      .setInteractive({ useHandCursor: true });
    const image = this.add.image(x, 270, avatar.texture);
    const previewHeight = 158;
    image.setDisplaySize(image.width * previewHeight / image.height, previewHeight);
    const label = this.add.text(x, 382, avatar.shortName.toUpperCase(), {
      fontFamily: 'Arial Black, Arial', fontSize: '15px', color: '#ffffff'
    }).setOrigin(0.5);

    const choose = () => this.registerPlayer(avatarId);
    card.on('pointerover', () => card.setFillStyle(0x1e3a8a, 1));
    card.on('pointerout', () => card.setFillStyle(0x172554, 0.9));
    card.on('pointerdown', choose);
    image.setInteractive({ useHandCursor: true }).on('pointerdown', choose);
    label.setInteractive({ useHandCursor: true }).on('pointerdown', choose);
  }

  createButton(x, y, label, color, action) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#0f172a',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setAlpha(0.82));
    button.on('pointerout', () => button.setAlpha(1));
    button.on('pointerdown', action);
  }

  registerPlayer(avatarId) {
    RetroAudio.confirm();
    const response = window.prompt(
      'PASO 3: ¿Cómo se llama el estudiante?',
      'Estudiante'
    );
    const cleanName = String(response || 'Estudiante').trim().slice(0, 18);
    GAME_STATE.playerName = cleanName || 'Estudiante';
    GAME_STATE.career = this.selectedCareer;
    GAME_STATE.avatar = avatarId;
    this.transitionToScene('MapScene');
  }

  transitionToScene(sceneKey, data) {
    this.cameras.main.fadeOut(350, 30, 41, 59);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneKey, data));
  }
}
