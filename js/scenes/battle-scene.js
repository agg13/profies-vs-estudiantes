class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.enemyId = data.enemyId || 'matematicas';
    this.enemy = ENEMY_CATALOG[this.enemyId];
    this.enemyHp = this.enemy.maxHp;
    this.playerHp = GAME_STATE.concentration;
    this.questions = [];
    this.questionIndex = 0;
    this.turnLocked = false;
  }

  create() {
    MusicService.play(this, this.enemy.music, { volume: 0.15, fadeIn: 650 });
    this.cameras.main.setBackgroundColor('#101827');
    this.cameras.main.fadeIn(420, 16, 24, 39);
    this.add.image(480, 270, this.enemy.background).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, 0x07111f, 0.26);
    this.add.rectangle(480, 170, 900, 280, 0x0f172a, 0.36).setStrokeStyle(4, 0xcbd5e1, 0.7);
    this.add.rectangle(480, 430, 900, 190, 0x0f172a, 0.92).setStrokeStyle(3, 0x64748b);

    this.createBattleHeader();

    this.prepareQuestions();
    this.createCharacters();
    this.createQuestionPanel();
    this.configureAnswerShortcuts();
    RetroAudio.battleStart();
    this.showNextQuestion();
  }

  createBattleHeader() {
    this.add.text(480, 22, this.enemy.name, {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#f8fafc',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.add.text(32, 24, 'BATALLA ACADÉMICA', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fbbf24'
    });
  }

  prepareQuestions() {
    const careerBankKey = getCareerQuestionBank();

    if (this.enemy.combinesCareerAndLabor) {
      this.questions = this.prepareCoordinatorQuestions(careerBankKey);
      return;
    }

    const subjectQuestions = Phaser.Utils.Array.Shuffle(
      (this.cache.json.get(this.enemy.subjectBank) || []).slice()
    );
    this.questions = subjectQuestions;

    if (!this.enemy.includesCareerCritical || !careerBankKey) return;

    const careerQuestions = this.cache.json.get(careerBankKey) || [];
    const selected = Phaser.Utils.Array.GetRandom(careerQuestions);
    if (!selected) return;

    const criticalQuestion = {
      ...selected,
      isCareerCritical: true,
      sourceLabel: getSelectedCareer()?.shortName || 'Carrera'
    };
    // Primero se presentan tres preguntas propias de la materia.
    // La cuarta es el único reto crítico de carrera.
    const criticalPosition = Math.min(3, this.questions.length);
    this.questions.splice(criticalPosition, 0, criticalQuestion);
  }

  prepareCoordinatorQuestions(careerBankKey) {
    if (!careerBankKey) return [];

    const careerQuestions = Phaser.Utils.Array.Shuffle(
      (this.cache.json.get(careerBankKey) || []).slice()
    );
    const laborQuestions = Phaser.Utils.Array.Shuffle(
      (this.cache.json.get('questions-laboral') || []).slice()
    );
    const combined = [];
    const total = Math.max(careerQuestions.length, laborQuestions.length);

    for (let index = 0; index < total; index += 1) {
      if (careerQuestions[index]) combined.push(careerQuestions[index]);
      if (laborQuestions[index]) combined.push(laborQuestions[index]);
    }
    return combined;
  }

  createCharacters() {
    const avatar = getSelectedAvatar();
    this.playerSprite = this.add.image(-90, 190, avatar.texture);
    const playerHeight = 190;
    this.playerSprite.setDisplaySize(
      this.playerSprite.width * playerHeight / this.playerSprite.height,
      playerHeight
    );
    this.enemySprite = this.add.image(1050, 178, this.enemy.texture);
    const enemyHeight = 215;
    this.enemySprite.setDisplaySize(
      this.enemySprite.width * enemyHeight / this.enemySprite.height,
      enemyHeight
    );

    this.add.text(70, 257, GAME_STATE.playerName || 'Estudiante', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f8fafc'
    });
    this.add.text(687, 257, this.enemy.name, {
      fontFamily: 'monospace', fontSize: '16px', color: '#f8fafc'
    });

    this.add.rectangle(70, 284, 205, 20, 0x0b1220).setOrigin(0, 0.5);
    this.playerHpBar = this.add.rectangle(73, 284, 199, 14, 0x22c55e).setOrigin(0, 0.5);
    this.add.rectangle(687, 284, 205, 20, 0x0b1220).setOrigin(0, 0.5);
    this.enemyHpBar = this.add.rectangle(690, 284, 199, 14, 0xef4444).setOrigin(0, 0.5);

    this.playerHpText = this.add.text(70, 300, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#cbd5e1'
    });
    this.enemyHpText = this.add.text(687, 300, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#cbd5e1'
    });
    this.updateHealthBars();

    this.tweens.add({
      targets: this.playerSprite, x: 155, duration: 520, ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: this.enemySprite, x: 805, duration: 620, ease: 'Back.easeOut'
    });
  }

  configureAnswerShortcuts() {
    this.input.keyboard.on('keydown', (event) => {
      if (this.turnLocked) return;
      const shortcuts = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      const answerIndex = shortcuts[event.key.toLowerCase()];
      if (answerIndex !== undefined) this.answerQuestion(answerIndex);
    });
  }

  createQuestionPanel() {
    this.topicText = this.add.text(48, 348, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#38bdf8'
    });
    this.questionText = this.add.text(48, 374, '', {
      fontFamily: 'Arial', fontSize: '18px', color: '#f8fafc',
      wordWrap: { width: 864 }, lineSpacing: 4
    });

    this.answerButtons = [];
    const positions = [[250, 450], [710, 450], [250, 505], [710, 505]];
    positions.forEach(([x, y], index) => {
      const background = this.add.rectangle(x, y, 420, 44, 0x334155)
        .setStrokeStyle(2, 0x64748b)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, '', {
        fontFamily: 'Arial', fontSize: '15px', color: '#f8fafc',
        wordWrap: { width: 390 }, align: 'center'
      }).setOrigin(0.5);
      background.on('pointerover', () => {
        if (!this.turnLocked) background.setFillStyle(0x475569);
      });
      background.on('pointerout', () => {
        if (!this.turnLocked) background.setFillStyle(0x334155);
      });
      background.on('pointerdown', () => this.answerQuestion(index));
      this.answerButtons.push({ background, label });
    });

    this.feedbackText = this.add.text(480, 333, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#fef3c7',
      wordWrap: { width: 850 }, align: 'center'
    }).setOrigin(0.5, 1);
  }

  showNextQuestion() {
    if (this.questionIndex >= this.questions.length) {
      this.finishBattle(false, 'Se agotó el banco antes de vencer al Profie.');
      return;
    }
    this.turnLocked = false;
    this.currentQuestion = this.questions[this.questionIndex];
    this.questionIndex += 1;
    this.feedbackText.setText('');
    if (this.currentQuestion.isCareerCritical) {
      this.topicText
        .setColor('#fbbf24')
        .setText(
          `⚡ RETO DE CARRERA · ${this.currentQuestion.sourceLabel} · ${this.currentQuestion.topic}`
        );
    } else {
      this.topicText
        .setColor('#38bdf8')
        .setText(
          `${this.currentQuestion.id} · ${this.currentQuestion.topic} · ${this.currentQuestion.difficulty}`
        );
    }
    this.questionText.setText(this.currentQuestion.question);
    this.answerButtons.forEach((button, index) => {
      button.background.setFillStyle(0x334155).setStrokeStyle(2, 0x64748b);
      button.label.setText(
        `${String.fromCharCode(65 + index)}) ${this.currentQuestion.options[index]}`
      );
    });
  }

  answerQuestion(selectedIndex) {
    if (this.turnLocked) return;
    this.turnLocked = true;
    const correct = selectedIndex === this.currentQuestion.correctIndex;

    this.answerButtons.forEach((button, index) => {
      if (index === this.currentQuestion.correctIndex) {
        button.background.setFillStyle(0x166534).setStrokeStyle(3, 0x4ade80);
      } else if (index === selectedIndex) {
        button.background.setFillStyle(0x991b1b).setStrokeStyle(3, 0xf87171);
      }
    });

    if (correct) {
      RetroAudio.confirm();
      RetroAudio.hit();
      const multiplier = this.currentQuestion.isCareerCritical ? 2 : 1;
      const damage = this.enemy.damagePerCorrectAnswer * multiplier;
      this.enemyHp = Math.max(0, this.enemyHp - damage);
      GAME_STATE.academicPoints += 10;
      this.feedbackText.setText(
        `${multiplier === 2 ? '¡ATAQUE CRÍTICO! ' : ''}¡Respuesta correcta! ${this.currentQuestion.explanation}`
      );
      this.showCombatEffect(805, 185, `-${damage}`, multiplier === 2 ? '#fde047' : '#86efac');
      this.tweens.add({
        targets: this.enemySprite, x: '+=12', yoyo: true, repeat: 3, duration: 70
      });
    } else {
      RetroAudio.alert();
      RetroAudio.hit();
      this.playerHp = Math.max(0, this.playerHp - this.enemy.damageToPlayer);
      const letter = String.fromCharCode(65 + this.currentQuestion.correctIndex);
      this.feedbackText.setText(
        `Respuesta incorrecta. Era ${letter}. ${this.currentQuestion.explanation}`
      );
      this.showCombatEffect(155, 185, `-${this.enemy.damageToPlayer}`, '#fca5a5');
      this.tweens.add({
        targets: this.playerSprite, alpha: 0.25, yoyo: true, repeat: 3, duration: 90
      });
    }
    this.updateHealthBars();

    this.time.delayedCall(2300, () => {
      if (this.enemyHp <= 0) this.finishBattle(true);
      else if (this.playerHp <= 0) this.finishBattle(false, 'Tu concentración llegó a cero.');
      else this.showNextQuestion();
    });
  }

  showCombatEffect(x, y, text, color) {
    const effect = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial', fontSize: '32px', color,
      stroke: '#0f172a', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: effect, y: y - 55, alpha: 0, duration: 850,
      ease: 'Cubic.easeOut', onComplete: () => effect.destroy()
    });
  }

  updateHealthBars() {
    const playerRatio = Phaser.Math.Clamp(this.playerHp / GAME_STATE.maxConcentration, 0, 1);
    const enemyRatio = Phaser.Math.Clamp(this.enemyHp / this.enemy.maxHp, 0, 1);
    this.playerHpBar.displayWidth = 199 * playerRatio;
    this.enemyHpBar.displayWidth = 199 * enemyRatio;
    this.playerHpText.setText(`Concentración ${this.playerHp}/${GAME_STATE.maxConcentration}`);
    this.enemyHpText.setText(`Resistencia ${this.enemyHp}/${this.enemy.maxHp}`);
  }

  finishBattle(victory, message = '') {
    this.turnLocked = true;
    this.answerButtons.forEach((button) => {
      button.background.disableInteractive();
      button.background.setVisible(false);
      button.label.setVisible(false);
    });
    this.questionText.setVisible(false);
    this.topicText.setVisible(false);

    if (victory) {
      RetroAudio.confirm();
      GAME_STATE.concentration = Math.max(25, this.playerHp);
      GAME_STATE.academicPoints += this.enemy.points;
      if (!GAME_STATE.defeatedEnemies.includes(this.enemyId)) {
        GAME_STATE.defeatedEnemies.push(this.enemyId);
      }
      if (this.enemy.reward) addUniqueItem(this.enemy.reward);
      if (this.enemyId === 'programacion') completeQuest('recover-antidote-code');
      if (this.enemyId === 'coordinador') completeQuest('save-campus');
      message = `¡Profie liberado! +${this.enemy.points} puntos académicos.`;
    } else {
      RetroAudio.alert();
      GAME_STATE.lives = Math.max(0, GAME_STATE.lives - 1);
      GAME_STATE.concentration = GAME_STATE.maxConcentration;
      message += ` Te quedan ${GAME_STATE.lives} oportunidades.`;
    }

    this.feedbackText.setText(message).setFontSize(20).setColor(victory ? '#86efac' : '#fca5a5');
    const isFinalVictory = victory && this.enemyId === 'coordinador';
    const isGameOver = !victory && GAME_STATE.lives <= 0;
    const button = this.add.rectangle(480, 455, 330, 54, victory ? 0x15803d : 0x2563eb)
      .setInteractive({ useHandCursor: true });
    const buttonLabel = isFinalVictory
      ? 'Ver desenlace'
      : isGameOver
        ? 'Ver resultado'
        : victory
          ? 'Continuar la historia'
          : 'Volver al campus';
    this.add.text(480, 455, buttonLabel, {
      fontFamily: 'monospace', fontSize: '17px', color: '#ffffff'
    }).setOrigin(0.5);
    button.on('pointerdown', () => {
      if (isFinalVictory) {
        this.transitionToScene('OutcomeScene', { outcome: 'victory' });
      } else if (isGameOver) {
        this.transitionToScene('OutcomeScene', { outcome: 'defeat' });
      } else {
        this.transitionToScene('MapScene');
      }
    });
  }

  transitionToScene(sceneKey, data) {
    MusicService.stop(this, 250);
    this.cameras.main.fadeOut(350, 7, 17, 31);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneKey, data));
  }
}
