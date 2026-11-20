class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('campus-map', 'assets/mapa/campus-definitivo-v1.png');
    this.load.image('vigilante', 'assets/personajes/vigilante.png');
    this.load.image('avatar-masculino', 'assets/personajes/avatar-masculino.png');
    this.load.image('avatar-femenino', 'assets/personajes/avatar-femenino.png');
    this.load.spritesheet(
      'avatar-masculino-sheet',
      'assets/personajes/avatar-masculino-movimiento.png',
      { frameWidth: 362, frameHeight: 362 }
    );
    this.load.spritesheet(
      'avatar-femenino-sheet',
      'assets/personajes/avatar-femenino-movimiento.png',
      { frameWidth: 362, frameHeight: 362 }
    );
    this.load.image('student-project', 'assets/personajes/estudiante-proyecto.png');
    this.load.image('cafeteria-lady', 'assets/personajes/encargada-cafeteria.png');
    this.load.image('sad-student', 'assets/personajes/estudiante-triste.png');
    this.load.image('profie-matematicas', 'assets/personajes/profie-matematicas.png');
    this.load.image('profie-programacion', 'assets/personajes/profie-programacion.png');
    this.load.image('profie-coordinador', 'assets/personajes/profie-coordinador.png');
    this.load.image('battle-math', 'assets/batallas/biblioteca-matematicas.png');
    this.load.image('battle-programming', 'assets/batallas/laboratorio-programacion.png');
    this.load.image('battle-coordinator', 'assets/batallas/oficina-coordinacion.png');
    this.load.audio('music-exploration', 'assets/audio/musica/exploracion-overworld.mp3');
    this.load.audio('music-battle-math', 'assets/audio/musica/batalla-matematicas.ogg');
    this.load.audio('music-battle-programming', 'assets/audio/musica/batalla-programacion.ogg');
    this.load.audio('music-battle-coordinator', 'assets/audio/musica/batalla-coordinador.ogg');
    this.load.json('questions-matematicas', 'assets/questions/matematicas.json');
    this.load.json('questions-programacion', 'assets/questions/programacion.json');
    this.load.json('questions-industrial', 'assets/questions/industrial.json');
    this.load.json('questions-sistemas', 'assets/questions/sistemas.json');
    this.load.json('questions-laboral', 'assets/questions/laboral.json');

    this.load.image('item-atlas', 'assets/sprites/items-final.png');

    const loadingText = this.add.text(480, 270, 'Preparando el campus...', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.load.on('complete', () => loadingText.setText('Campus preparado'));
  }

  create() {
    this.createItemFrames();
    this.createAvatarAnimations();
    this.scene.start('IntroScene');
  }

  createItemFrames() {
    // La lámina aprobada se divide en celdas de 280 px sin modificar el PNG.
    // Phaser recorta únicamente los elementos utilizados por el juego.
    const texture = this.textures.get('item-atlas');
    const frames = {
      coin: [0, 0, 280, 280],
      bill: [280, 0, 280, 280],
      coffee: [560, 0, 280, 280],
      food: [1120, 0, 282, 280],
      laptop: [0, 280, 280, 280],
      formula: [280, 280, 280, 280],
      credential: [840, 280, 280, 280],
      notes: [1120, 280, 282, 280],
      code: [0, 560, 280, 280],
      'extra-life': [280, 560, 280, 280]
    };

    Object.entries(frames).forEach(([name, [x, y, width, height]]) => {
      texture.add(name, 0, x, y, width, height);
    });
  }

  createAvatarAnimations() {
    const rows = {
      down: [0, 2],
      left: [3, 5],
      right: [6, 8],
      up: [9, 11]
    };

    ['masculino', 'femenino'].forEach((avatarId) => {
      const texture = AVATAR_CATALOG[avatarId].spriteTexture;
      Object.entries(rows).forEach(([direction, frames]) => {
        this.anims.create({
          key: `${avatarId}-walk-${direction}`,
          frames: this.anims.generateFrameNumbers(texture, {
            start: frames[0],
            end: frames[1]
          }),
          frameRate: 7,
          repeat: -1
        });
      });
    });
  }

}
