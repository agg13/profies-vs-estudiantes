const GAME_STATE = {
  playerName: '',
  career: '',
  avatar: 'masculino',
  position: { x: 768, y: 930 },
  currentZone: 'entrada',
  concentration: 100,
  maxConcentration: 100,
  knowledge: 10,
  resistance: 5,
  academicPoints: 0,
  coins: 0,
  lives: 3,
  extraLifeUnlocked: false,
  inventory: [],
  collectedItems: [],
  defeatedEnemies: [],
  activeQuests: [],
  completedQuests: []
};

// DONE SEMANA 2.1: copia profunda y restauración sin cambiar la referencia.
const DEFAULT_GAME_STATE = JSON.parse(JSON.stringify(GAME_STATE));

function resetGameState() {
  const cleanState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
  Object.keys(GAME_STATE).forEach((key) => delete GAME_STATE[key]);
  Object.assign(GAME_STATE, cleanState);
}

const CAREER_CATALOG = {
  industrial: {
    name: 'Ingeniería Industrial',
    shortName: 'Industrial',
    questionBank: 'questions-industrial'
  },
  sistemas: {
    name: 'Ingeniería en Sistemas y Tecnologías Computacionales',
    shortName: 'Sistemas y TC',
    questionBank: 'questions-sistemas'
  }
};

const AVATAR_CATALOG = {
  masculino: {
    name: 'Avatar masculino',
    shortName: 'Masculino',
    texture: 'avatar-masculino',
    spriteTexture: 'avatar-masculino-sheet'
  },
  femenino: {
    name: 'Avatar femenino',
    shortName: 'Femenino',
    texture: 'avatar-femenino',
    spriteTexture: 'avatar-femenino-sheet'
  }
};

const ITEM_CATALOG = {
  coin: { name: 'Moneda', type: 'currency', value: 1 },
  bill: { name: 'Billete', type: 'currency', value: 5 },
  coffee: { name: 'Café', type: 'consumable', recovery: 25 },
  food: { name: 'Comida', type: 'quest' },
  laptop: { name: 'Laptop', type: 'quest' },
  formula: { name: 'Formulario matemático', type: 'battle' },
  notes: { name: 'Apuntes perdidos', type: 'quest' },
  code: { name: 'Código del antídoto', type: 'quest' },
  credential: { name: 'Credencial de Coordinación', type: 'quest' }
};

const ENEMY_CATALOG = {
  matematicas: {
    name: 'Profie de Matemáticas',
    maxHp: 80,
    damagePerCorrectAnswer: 20,
    damageToPlayer: 25,
    subjectBank: 'questions-matematicas',
    includesCareerCritical: true,
    reward: 'formula',
    points: 50,
    texture: 'profie-matematicas',
    background: 'battle-math',
    music: 'music-battle-math'
  },
  programacion: {
    name: 'Profie de Programación',
    maxHp: 80,
    damagePerCorrectAnswer: 20,
    damageToPlayer: 25,
    subjectBank: 'questions-programacion',
    includesCareerCritical: true,
    reward: 'code',
    points: 75,
    texture: 'profie-programacion',
    background: 'battle-programming',
    music: 'music-battle-programming'
  },
  coordinador: {
    name: 'Profie Coordinador',
    maxHp: 100,
    damagePerCorrectAnswer: 20,
    damageToPlayer: 30,
    combinesCareerAndLabor: true,
    reward: null,
    points: 100,
    texture: 'profie-coordinador',
    background: 'battle-coordinator',
    music: 'music-battle-coordinator'
  }
};

function getSelectedCareer() {
  return CAREER_CATALOG[GAME_STATE.career] || null;
}

function getSelectedAvatar() {
  return AVATAR_CATALOG[GAME_STATE.avatar] || AVATAR_CATALOG.masculino;
}

function getCareerQuestionBank() {
  return getSelectedCareer()?.questionBank || null;
}

function hasItem(itemId) {
  return GAME_STATE.inventory.includes(itemId);
}

function addUniqueItem(itemId) {
  if (!hasItem(itemId)) GAME_STATE.inventory.push(itemId);
}

function removeItem(itemId) {
  const index = GAME_STATE.inventory.indexOf(itemId);
  if (index >= 0) GAME_STATE.inventory.splice(index, 1);
}

function completeQuest(questId) {
  GAME_STATE.activeQuests = GAME_STATE.activeQuests.filter(
    (id) => id !== questId
  );
  if (!GAME_STATE.completedQuests.includes(questId)) {
    GAME_STATE.completedQuests.push(questId);
  }
}

