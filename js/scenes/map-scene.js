class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
    this.currentInteraction = null;
    this.dialogOpen = false;
    this.inventoryOpen = false;
    // DONE SEMANA 2.4A: estado independiente para el panel de estadísticas.
    this.statisticsOpen = false;
  }

  create() {
    MusicService.play(this, 'music-exploration', { volume: 0.12, fadeIn: 900 });
    this.worldWidth = 1536;
    this.worldHeight = 1024;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBackgroundColor('#335c3a');
    this.cameras.main.fadeIn(420, 7, 17, 31);

    this.createCampusMap();
    this.createItems();
    this.createCharactersAndInteractions();
    this.createPlayer();
    this.createObjectiveMarker();
    this.createHud();
    this.configureControls();

    this.physics.add.collider(this.player, this.walls);

    // DONE SEMANA 1: overlap detecta el contacto sin bloquear el movimiento.
    // DONE SEMANA 1: recolección activa mediante overlap.
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.showProgressMessage();
  }

  showProgressMessage() {
    if (GAME_STATE.defeatedEnemies.includes('coordinador')) {
      this.showMessage('El campus está a salvo. Has completado La última asesoría mortal.');
      return;
    }

    if (GAME_STATE.defeatedEnemies.includes('programacion')) {
      this.showMessage(
        'Código recuperado. Lleva el antídoto a Coordinación para enfrentar al último Profie.'
      );
      return;
    }

    if (GAME_STATE.defeatedEnemies.includes('matematicas')) {
      if (hasItem('laptop')) {
        this.showMessage(
          'Ya tienes la laptop. Dirígete a los laboratorios para enfrentar al Profie de Programación.'
        );
      } else if (hasItem('food')) {
        this.showMessage(
          'Llevas la comida. Regresa con los estudiantes de bachillerato; podrían prestarte algo útil.'
        );
      } else if (GAME_STATE.activeQuests.includes('project-with-hunger')) {
        this.showMessage(
          'Los estudiantes necesitan comida para terminar su proyecto. Busca ayuda en la cafetería.'
        );
      } else {
        this.showMessage(
          'Profie de Matemáticas: El siguiente infectado está en los laboratorios. Antes de ir, busca a los estudiantes de bachillerato y ayúdalos; pueden darte el equipo que necesitas.'
        );
      }
      return;
    }

    this.showMessage(
      `Vigilante: Bienvenido, ${GAME_STATE.playerName}. Busca la biblioteca. Muévete con WASD o flechas; usa E para interactuar, I para inventario y P para tu perfil.`
    );
  }

  configureControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.interactKey = this.input.keyboard.addKey('E');
    this.inventoryKey = this.input.keyboard.addKey('I');
    // DONE SEMANA 2.4B: P abre el perfil sin interferir con WASD.
    this.statisticsKey = this.input.keyboard.addKey('P');
  }

  createCampusMap() {
    // El mapa ilustrado es la referencia espacial definitiva. Las colisiones
    // se construyen encima como zonas invisibles para mantener el arte limpio.
    this.add.image(0, 0, 'campus-map').setOrigin(0).setDepth(0);
    this.walls = this.physics.add.staticGroup();

    // Perímetro arbolado y edificios. Los rectángulos se ajustan a las masas
    // visuales del mapa dejando libres banquetas, accesos y la plaza.
    const colliders = [
      [768, 22, 1536, 44],
      [22, 512, 44, 1024],
      [1514, 512, 44, 1024],
      [220, 245, 245, 185],
      [530, 260, 250, 120],
      [875, 150, 220, 145],
      [1360, 125, 220, 170],
      [270, 505, 235, 180],
      [575, 395, 180, 125],
      [575, 535, 185, 125],
      [930, 350, 340, 170],
      [1215, 420, 185, 135],
      [320, 750, 515, 210],
      [865, 675, 165, 155],
      [1015, 695, 170, 160],
      [1165, 690, 200, 175]
    ];
    colliders.forEach((values) => this.addMapCollider(...values));

    this.addLocationLabel(768, 965, 'ENTRADA');
    this.addLocationLabel(250, 620, 'BIBLIOTECA');
    this.addLocationLabel(875, 250, 'CAFETERÍA');
    this.addLocationLabel(1220, 535, 'LABORATORIOS');
    this.addLocationLabel(1015, 810, 'COORDINACIÓN');
    this.addLocationLabel(1020, 525, 'PLAZA CENTRAL');
  }

  addMapCollider(x, y, width, height) {
    const obstacle = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(obstacle, true);
    this.walls.add(obstacle);
  }

  addLocationLabel(x, y, label) {
    this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#172554cc',
      padding: { x: 8, y: 5 },
      stroke: '#0f172a',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(7);
  }

  createPlayer() {
    const start = GAME_STATE.position || { x: 768, y: 930 };
    const avatar = getSelectedAvatar();
    this.player = this.physics.add.sprite(
      start.x,
      start.y,
      avatar.spriteTexture,
      1
    );
    const playerHeight = 104;
    this.player.setDisplaySize(
      this.player.width * playerHeight / this.player.height,
      playerHeight
    );
    this.player.setCollideWorldBounds(true);
    const bodyWidth = this.player.width * 0.42;
    const bodyHeight = this.player.height * 0.16;
    this.player.body.setSize(bodyWidth, bodyHeight).setOffset(
      (this.player.width - bodyWidth) / 2,
      this.player.height * 0.80
    );
    this.player.setDepth(20);
  }

  createItems() {
    this.items = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    this.addItem(720, 885, 'coin', 'coin-entrada');
    this.addItem(420, 610, 'coin', 'coin-biblioteca');
    this.addItem(605, 630, 'bill', 'bill-pasillo-oeste');
    this.addItem(1010, 545, 'coin', 'coin-plaza');
    this.addItem(1215, 565, 'coin', 'coin-laboratorios');
    this.addItem(355, 120, 'notes', 'notes-canchas');
    this.addItem(1250, 230, 'coin', 'coin-gite');
  }

  addItem(x, y, itemId, spawnId) {
    if (GAME_STATE.collectedItems.includes(spawnId)) return;

    const item = this.items.create(x, y, 'item-atlas', itemId);
    item.setDisplaySize(42, 42);
    item.setData('itemId', itemId);
    item.setData('spawnId', spawnId);
    item.body.setAllowGravity(false);
    item.setDepth(12);
  }

  collectItem(player, item) {
    const itemId = item.getData('itemId');
    const spawnId = item.getData('spawnId');
    const definition = ITEM_CATALOG[itemId];

    if (definition.type === 'currency') {
      GAME_STATE.coins += definition.value;
      GAME_STATE.academicPoints += definition.value;
    } else {
      addUniqueItem(itemId);
    }

    if (!GAME_STATE.collectedItems.includes(spawnId)) {
      GAME_STATE.collectedItems.push(spawnId);
    }

    item.disableBody(true, true);
    if (definition.type === 'currency') RetroAudio.coin();
    else RetroAudio.confirm();
    this.refreshHud();
    this.showMessage(`Recogiste: ${definition.name}`);
  }

  createCharactersAndInteractions() {
    this.interactions = [];

    this.addNpc('vigilante', 710, 930, 'guard', 108);
    this.addNpc('student-project', 150, 365, 'student-project', 96);
    this.addNpc('cafeteria-lady', 875, 255, 'cafeteria', 104);
    this.addNpc('sad-student', 390, 145, 'sad-student', 100);

    this.addInteraction('library', 250, 620, 88);
    this.addInteraction('laboratory', 1215, 535, 88);
    this.addInteraction('coordination', 1015, 810, 88);
  }

  addNpc(texture, x, y, interactionId, displayHeight = 84) {
    const character = this.add.image(x, y, texture).setOrigin(0.5, 0.9).setDepth(14);
    character.setDisplaySize(
      character.width * displayHeight / character.height,
      displayHeight
    );
    this.addInteraction(interactionId, x, y, 85);
  }

  addInteraction(id, x, y, range) {
    this.interactions.push({ id, x, y, range });
  }

  createObjectiveMarker() {
    const arrow = this.add.triangle(0, 0, 0, 0, 24, 0, 12, 18, 0xfacc15)
      .setStrokeStyle(3, 0x7c2d12);
    const ring = this.add.circle(0, 35, 19, 0xfacc15, 0.18)
      .setStrokeStyle(4, 0xfacc15);
    this.objectiveMarker = this.add.container(0, 0, [arrow, ring]).setDepth(45);
    this.tweens.add({
      targets: [arrow, ring], y: '+=10', duration: 650,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
    this.updateObjectiveMarker();
  }

  getObjectiveTarget() {
    if (GAME_STATE.defeatedEnemies.includes('coordinador')) return null;
    if (GAME_STATE.defeatedEnemies.includes('programacion')) {
      return { x: 1015, y: 735 };
    }
    if (GAME_STATE.defeatedEnemies.includes('matematicas')) {
      if (hasItem('laptop')) return { x: 1215, y: 460 };
      if (hasItem('food')) return { x: 150, y: 290 };
      if (GAME_STATE.activeQuests.includes('project-with-hunger')) {
        return { x: 875, y: 180 };
      }
      return { x: 150, y: 290 };
    }
    return { x: 250, y: 545 };
  }

  updateObjectiveMarker() {
    if (!this.objectiveMarker) return;
    const target = this.getObjectiveTarget();
    if (!target) {
      this.objectiveMarker.setVisible(false);
      return;
    }
    this.objectiveMarker.setVisible(true).setPosition(target.x, target.y);
  }

  createHud() {
    // HUD reducido: conserva únicamente la información necesaria para explorar.
    // El perfil completo queda disponible con P o mediante el botón PERFIL.
    this.hudBackground = this.add.rectangle(230, 42, 430, 70, 0x0f172a, 0.82)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(2, 0x38bdf8);

    this.hudText = this.add.text(28, 14, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#f8fafc'
    }).setScrollFactor(0).setDepth(101);

    this.objectiveText = this.add.text(28, 43, '', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#fde047'
    }).setScrollFactor(0).setDepth(101);

    this.profileButton = this.add.rectangle(872, 34, 146, 44, 0x0369a1, 0.94)
      .setScrollFactor(0)
      .setDepth(102)
      .setStrokeStyle(2, 0x7dd3fc)
      .setInteractive({ useHandCursor: true });
    this.profileButtonText = this.add.text(872, 34, 'PERFIL  [P]', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(103);
    this.profileButton.on('pointerover', () => this.profileButton.setFillStyle(0x0284c7, 1));
    this.profileButton.on('pointerout', () => {
      this.profileButton.setFillStyle(this.statisticsOpen ? 0x9a3412 : 0x0369a1, 0.94);
    });
    this.profileButton.on('pointerdown', () => {
      if (this.dialogOpen) return;
      RetroAudio.beep();
      this.toggleStatistics();
    });

    this.promptText = this.add.text(480, 490, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '21px',
      color: '#0f172a',
      backgroundColor: '#facc15',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setVisible(false);

    this.refreshHud();
  }

  refreshHud() {
    const lives = '♥'.repeat(GAME_STATE.lives);
    const extra = GAME_STATE.extraLifeUnlocked ? '♥' : '♡';
    this.hudText.setText(
      `VIDAS ${lives}${extra}     CRÉDITOS ${GAME_STATE.coins}     PUNTOS ${GAME_STATE.academicPoints}`
    );
    this.objectiveText.setText(`OBJETIVO: ${this.getCurrentObjective()}`);
    this.updateObjectiveMarker();
  }

  getCurrentObjective() {
    if (GAME_STATE.defeatedEnemies.includes('coordinador')) {
      return 'Campus liberado';
    }
    if (GAME_STATE.defeatedEnemies.includes('programacion')) {
      return 'Lleva el código a Coordinación';
    }
    if (GAME_STATE.defeatedEnemies.includes('matematicas')) {
      if (hasItem('laptop')) return 'Ve a los laboratorios';
      if (hasItem('food')) return 'Entrega la comida a los estudiantes';
      if (GAME_STATE.activeQuests.includes('project-with-hunger')) {
        return 'Consigue comida en la cafetería';
      }
      return 'Busca estudiantes que necesiten ayuda';
    }
    return 'Investiga la biblioteca';
  }

  movePlayer() {
    const speed = 220;
    let direction = null;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.body.setVelocityX(-speed);
      direction = 'left';
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.body.setVelocityX(speed);
      direction = 'right';
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.body.setVelocityY(-speed);
      direction = 'up';
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.body.setVelocityY(speed);
      direction = 'down';
    }

    if (this.player.body.velocity.length() > 0) {
      this.player.body.velocity.normalize().scale(speed);
      this.player.setData('lastDirection', direction);
      this.player.anims.play(`${GAME_STATE.avatar}-walk-${direction}`, true);
    } else {
      this.player.body.setVelocity(0);
      this.player.anims.stop();
      const lastDirection = this.player.getData('lastDirection') || 'down';
      const idleFrames = { down: 1, left: 4, right: 7, up: 10 };
      this.player.setFrame(idleFrames[lastDirection]);
    }
  }

  updateInteractionPrompt() {
    this.currentInteraction = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.interactions.forEach((interaction) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        interaction.x,
        interaction.y
      );
      if (distance <= interaction.range && distance < bestDistance) {
        bestDistance = distance;
        this.currentInteraction = interaction;
      }
    });

    this.promptText.setVisible(Boolean(this.currentInteraction));
    if (this.currentInteraction) {
      this.promptText.setText('E / Espacio: interactuar');
    }
  }

  interact() {
    if (!this.currentInteraction) return;
    RetroAudio.beep();

    const actions = {
      guard: () => this.interactGuard(),
      'student-project': () => this.interactStudentProject(),
      cafeteria: () => this.interactCafeteria(),
      'sad-student': () => this.interactSadStudent(),
      library: () => this.interactLibrary(),
      laboratory: () => this.interactLaboratory(),
      coordination: () => this.interactCoordination()
    };

    actions[this.currentInteraction.id]?.();
  }

  interactGuard() {
    // DONE SEMANA 2.2F: el Vigilante es el único punto de guardado y confirma
    // la decisión antes de modificar localStorage.
    const wantsToSave = window.confirm(
      '¿Deseas guardar la partida en este punto? El avance posterior no se conservará hasta que vuelvas a guardar.'
    );
    if (!wantsToSave) {
      this.showMessage('Vigilante: No se guardó la partida. Tu avance continúa solo en esta sesión.');
      return;
    }

    GAME_STATE.position = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    const saved = SaveService.save();
    this.showMessage(
      saved
        ? 'Vigilante: Partida guardada. Ten cuidado con los Profies.'
        : 'Vigilante: El sistema de guardado todavía debe implementarse en la semana 2.'
    );
  }

  interactStudentProject() {
    if (hasItem('laptop')) {
      this.showMessage('Estudiante: Gracias otra vez. La laptop te ayudará en el laboratorio.');
      return;
    }

    if (hasItem('food')) {
      removeItem('food');
      addUniqueItem('laptop');
      completeQuest('project-with-hunger');
      GAME_STATE.academicPoints += 20;
      this.refreshHud();
      this.showMessage('Entregaste la comida. Los estudiantes te prestaron una laptop.');
      return;
    }

    if (!GAME_STATE.activeQuests.includes('project-with-hunger')) {
      GAME_STATE.activeQuests.push('project-with-hunger');
    }
    this.refreshHud();
    this.showMessage('Estudiante: Necesitamos comida para terminar el proyecto. Busca la cafetería.');
  }

  interactCafeteria() {
    if (hasItem('food')) {
      this.showMessage('Cafetería: Ya llevas una comida. Entrégala antes de comprar otra.');
      return;
    }

    if (GAME_STATE.coins < 10) {
      RetroAudio.alert();
      this.showMessage(`Cafetería: La comida cuesta 10 créditos. Tienes ${GAME_STATE.coins}.`);
      return;
    }

    GAME_STATE.coins -= 10;
    addUniqueItem('food');
    this.refreshHud();
    this.showMessage('Compraste comida para los estudiantes de bachillerato.');
  }

  interactSadStudent() {
    if (GAME_STATE.extraLifeUnlocked) {
      this.showMessage('Estudiante: Gracias por ayudarme. Voy a intentarlo nuevamente.');
      return;
    }

    if (hasItem('notes')) {
      removeItem('notes');
      GAME_STATE.extraLifeUnlocked = true;
      GAME_STATE.lives += 1;
      completeQuest('lost-notes');
      this.refreshHud();
      this.showMessage('Devolviste los apuntes y obtuviste una oportunidad adicional.');
      return;
    }

    if (!GAME_STATE.activeQuests.includes('lost-notes')) {
      GAME_STATE.activeQuests.push('lost-notes');
    }
    this.showMessage('Estudiante: Perdí mis apuntes cerca de las canchas. ¿Puedes ayudarme?');
  }

  interactLibrary() {
    if (GAME_STATE.defeatedEnemies.includes('matematicas')) {
      this.showMessage('Biblioteca: El Profie de Matemáticas ya fue liberado.');
      return;
    }

    GAME_STATE.position = { x: 250, y: 620 };
    this.startBattle('matematicas');
  }

  interactLaboratory() {
    if (GAME_STATE.defeatedEnemies.includes('programacion')) {
      this.showMessage('Laboratorio: El Profie de Programación ya fue liberado. Lleva el código del antídoto a Coordinación.');
      return;
    }

    if (!GAME_STATE.defeatedEnemies.includes('matematicas')) {
      RetroAudio.alert();
      this.showMessage('Laboratorio: Primero investiga qué ocurre en la biblioteca.');
      return;
    }

    if (!hasItem('laptop')) {
      RetroAudio.alert();
      this.showMessage('Laboratorio: Acceso bloqueado. Necesitas conseguir una laptop.');
      return;
    }

    GAME_STATE.position = { x: 1215, y: 535 };
    this.startBattle('programacion');
  }

  interactCoordination() {
    if (GAME_STATE.defeatedEnemies.includes('coordinador')) {
      this.transitionToScene('OutcomeScene', { outcome: 'victory' });
      return;
    }

    if (!GAME_STATE.defeatedEnemies.includes('programacion')) {
      RetroAudio.alert();
      this.showMessage('Coordinación: Debes recuperar primero el código del antídoto.');
      return;
    }

    if (!hasItem('code')) {
      RetroAudio.alert();
      this.showMessage('Coordinación: Falta el código del antídoto. Revisa el laboratorio.');
      return;
    }

    GAME_STATE.position = { x: 1015, y: 810 };
    this.startBattle('coordinador');
  }

  startBattle(enemyId) {
    this.transitionToScene('BattleScene', { enemyId });
  }

  transitionToScene(sceneKey, data) {
    this.player.body.setVelocity(0);
    MusicService.stop(this, 250);
    this.cameras.main.fadeOut(350, 7, 17, 31);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneKey, data));
  }

  toggleInventory() {
    if (this.statisticsOpen) this.closeStatistics();
    if (this.inventoryPanel) this.inventoryPanel.destroy();

    this.inventoryOpen = !this.inventoryOpen;
    if (!this.inventoryOpen) return;

    const itemNames = GAME_STATE.inventory.length
      ? GAME_STATE.inventory.map((id) => `• ${ITEM_CATALOG[id]?.name || id}`).join('\n')
      : 'Inventario vacío';

    this.inventoryPanel = this.add.container(480, 270).setScrollFactor(0).setDepth(200);
    const background = this.add.rectangle(0, 0, 520, 350, 0x0f172a, 0.97)
      .setStrokeStyle(4, 0xfacc15);
    const title = this.add.text(0, -135, 'INVENTARIO', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#facc15'
    }).setOrigin(0.5);
    const contents = this.add.text(-220, -90, itemNames, {
      fontFamily: 'Arial', fontSize: '22px', color: '#f8fafc', lineSpacing: 8
    });
    const footer = this.add.text(0, 135, 'Presiona I para cerrar', {
      fontFamily: 'Arial', fontSize: '18px', color: '#94a3b8'
    }).setOrigin(0.5);
    this.inventoryPanel.add([background, title, contents, footer]);
  }

  closeStatistics() {
    this.statisticsOpen = false;
    this.statisticsPanel?.destroy();
    this.statisticsPanel = null;
    this.updateProfileButton();
  }

  updateProfileButton() {
    if (!this.profileButton || !this.profileButtonText) return;
    this.profileButton.setFillStyle(this.statisticsOpen ? 0x9a3412 : 0x0369a1, 0.94);
    this.profileButtonText.setText(this.statisticsOpen ? 'CERRAR  [P]' : 'PERFIL  [P]');
  }

  toggleStatistics() {
    // DONE SEMANA 2.4C: panel completo, mutuamente excluyente con inventario.
    if (this.inventoryOpen) {
      this.inventoryOpen = false;
      this.inventoryPanel?.destroy();
      this.inventoryPanel = null;
    }

    if (this.statisticsOpen) {
      this.closeStatistics();
      return;
    }

    this.statisticsOpen = true;
    this.updateProfileButton();
    const career = getSelectedCareer()?.name || 'Sin carrera registrada';
    const statistics = [
      `Nombre: ${GAME_STATE.playerName}`,
      `Carrera: ${career}`,
      `Avatar: ${getSelectedAvatar().shortName}`,
      `Concentración: ${GAME_STATE.concentration}/${GAME_STATE.maxConcentration}`,
      `Conocimiento: ${GAME_STATE.knowledge}`,
      `Resistencia: ${GAME_STATE.resistance}`,
      `Puntos académicos: ${GAME_STATE.academicPoints}`,
      `Monedas: ${GAME_STATE.coins}`,
      `Oportunidades: ${GAME_STATE.lives}`,
      `Objetos actuales: ${GAME_STATE.inventory.length}`,
      `Objetos recogidos: ${GAME_STATE.collectedItems.length}`,
      `Profies liberados: ${GAME_STATE.defeatedEnemies.length}`,
      `Misiones completadas: ${GAME_STATE.completedQuests.length}`
    ].join('\n');

    this.statisticsPanel = this.add.container(480, 270).setScrollFactor(0).setDepth(200);
    const background = this.add.rectangle(0, 0, 660, 420, 0x0f172a, 0.98)
      .setStrokeStyle(4, 0x38bdf8);
    const title = this.add.text(0, -175, 'ESTADÍSTICAS', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#7dd3fc'
    }).setOrigin(0.5);
    const contents = this.add.text(-285, -135, statistics, {
      fontFamily: 'Arial', fontSize: '19px', color: '#f8fafc', lineSpacing: 5
    });
    const footer = this.add.text(0, 176, 'Presiona P para cerrar', {
      fontFamily: 'Arial', fontSize: '18px', color: '#94a3b8'
    }).setOrigin(0.5);
    this.statisticsPanel.add([background, title, contents, footer]);
  }

  showMessage(message) {
    this.dialogOpen = true;
    if (this.dialogPanel) this.dialogPanel.destroy();

    this.dialogPanel = this.add.container(480, 420)
      .setScrollFactor(0)
      .setDepth(180);
    const background = this.add.rectangle(0, 0, 880, 150, 0x0f172a, 0.96)
      .setStrokeStyle(4, 0xf8fafc);
    const text = this.add.text(-410, -45, message, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#f8fafc',
      wordWrap: { width: 820 },
      lineSpacing: 6
    });
    const close = this.add.text(410, 52, 'E: cerrar', {
      fontFamily: 'Arial', fontSize: '16px', color: '#facc15'
    }).setOrigin(1, 0.5);
    this.dialogPanel.add([background, text, close]);
  }

  closeMessage() {
    this.dialogOpen = false;
    this.dialogPanel?.destroy();
    this.dialogPanel = null;
  }

  update() {
    if (!this.player) return;

    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      RetroAudio.beep();
      this.toggleInventory();
    }

    if (Phaser.Input.Keyboard.JustDown(this.statisticsKey)) {
      // DONE SEMANA 2.4D: apertura mediante P y pausa del desplazamiento.
      RetroAudio.beep();
      this.toggleStatistics();
    }

    if (this.inventoryOpen || this.statisticsOpen) {
      this.player.body.setVelocity(0);
      return;
    }

    const wantsToInteract =
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space);

    if (this.dialogOpen) {
      this.player.body.setVelocity(0);
      if (wantsToInteract) this.closeMessage();
      return;
    }

    // DONE SEMANA 1: movimiento y animación actualizados en cada cuadro.
    this.movePlayer();

    this.updateInteractionPrompt();
    if (wantsToInteract) this.interact();

    GAME_STATE.position = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }
}

