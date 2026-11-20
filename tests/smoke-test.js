const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const banks = {
  'questions-matematicas': JSON.parse(read('assets/questions/matematicas.json')),
  'questions-programacion': JSON.parse(read('assets/questions/programacion.json')),
  'questions-industrial': JSON.parse(read('assets/questions/industrial.json')),
  'questions-sistemas': JSON.parse(read('assets/questions/sistemas.json')),
  'questions-laboral': JSON.parse(read('assets/questions/laboral.json'))
};

Object.entries(banks).forEach(([key, questions]) => {
  assert.strictEqual(questions.length, 40, `${key} debe contener 40 preguntas`);
  questions.forEach((question) => {
    assert.strictEqual(question.options.length, 4, `${question.id} debe tener cuatro opciones`);
    assert.ok(Number.isInteger(question.correctIndex), `${question.id} requiere correctIndex entero`);
    assert.ok(question.correctIndex >= 0 && question.correctIndex <= 3, `${question.id} tiene correctIndex inválido`);
  });
});

const context = vm.createContext({
  console,
  Phaser: {
    Scene: class {},
    Utils: {
      Array: {
        Shuffle: (items) => items,
        GetRandom: (items) => items[0]
      }
    }
  }
});

vm.runInContext(
  `${read('js/data/game-state.js')}\nthis.GAME_STATE = GAME_STATE; this.ENEMY_CATALOG = ENEMY_CATALOG;`,
  context
);
vm.runInContext(`${read('js/scenes/battle-scene.js')}\nthis.BattleScene = BattleScene;`, context);

function prepareBattle(enemyId, career) {
  context.GAME_STATE.career = career;
  const battle = new context.BattleScene();
  battle.enemyId = enemyId;
  battle.enemy = context.ENEMY_CATALOG[enemyId];
  battle.cache = { json: { get: (key) => banks[key] || [] } };
  battle.prepareQuestions();
  return battle.questions;
}

['industrial', 'sistemas'].forEach((career) => {
  ['matematicas', 'programacion'].forEach((enemyId) => {
    const questions = prepareBattle(enemyId, career);
    assert.ok(questions.length >= 41, `${enemyId}/${career} debe incluir el reto crítico`);
    assert.strictEqual(questions.filter((question) => question.isCareerCritical).length, 1);
    assert.strictEqual(questions[3].isCareerCritical, true, 'El reto crítico debe aparecer después de tres preguntas');
  });

  const coordinatorQuestions = prepareBattle('coordinador', career);
  assert.strictEqual(coordinatorQuestions.length, 80, 'Coordinación debe combinar carrera y vida laboral');
});

const mapSource = read('js/scenes/map-scene.js');
assert.match(mapSource, /defeatedEnemies\.includes\('matematicas'\)/);
assert.match(mapSource, /startBattle\('programacion'\)/);
assert.match(mapSource, /hasItem\('code'\)/);
assert.match(mapSource, /startBattle\('coordinador'\)/);
assert.match(mapSource, /campus-map/);
assert.match(mapSource, /getCurrentObjective\(\)/);
assert.match(mapSource, /PERFIL  \[P\]/);
assert.match(mapSource, /this\.worldWidth = 1536/);
assert.ok(fs.existsSync(path.join(root, 'assets/mapa/campus-definitivo-v1.png')));
assert.match(mapSource, /createObjectiveMarker\(\)/);
assert.match(mapSource, /getObjectiveTarget\(\)/);

const characterAssets = [
  'avatar-masculino.png',
  'avatar-femenino.png',
  'avatar-masculino-movimiento.png',
  'avatar-femenino-movimiento.png',
  'vigilante.png',
  'estudiante-proyecto.png',
  'encargada-cafeteria.png',
  'estudiante-triste.png',
  'profie-matematicas.png',
  'profie-programacion.png',
  'profie-coordinador.png'
];
characterAssets.forEach((filename) => {
  assert.ok(
    fs.existsSync(path.join(root, 'assets/personajes', filename)),
    `Falta el personaje gráfico ${filename}`
  );
});

const bootSource = read('js/scenes/boot-scene.js');
characterAssets.forEach((filename) => assert.match(bootSource, new RegExp(filename.replace('.', '\\.'))));
assert.doesNotMatch(bootSource, /createPersonTexture/);
assert.match(read('js/data/game-state.js'), /AVATAR_CATALOG/);
assert.match(read('js/scenes/name-scene.js'), /createAvatarSelectionMenu/);
assert.match(read('js/scenes/name-scene.js'), /selectedCareer/);
assert.match(mapSource, /getSelectedAvatar\(\)/);
assert.match(mapSource, /walk-\$\{direction\}/);
assert.match(mapSource, /const playerHeight = 104/);
assert.match(bootSource, /items-final\.png/);
assert.match(bootSource, /createItemFrames\(\)/);
assert.match(bootSource, /createAvatarAnimations\(\)/);
assert.match(bootSource, /frameWidth: 362/);
assert.ok(fs.existsSync(path.join(root, 'assets/sprites/items-final.png')));

const musicAssets = [
  'exploracion-overworld.mp3',
  'batalla-matematicas.ogg',
  'batalla-programacion.ogg',
  'batalla-coordinador.ogg'
];
musicAssets.forEach((filename) => {
  assert.ok(fs.existsSync(path.join(root, 'assets/audio/musica', filename)));
  assert.match(bootSource, new RegExp(filename.replace('.', '\\.')));
});
assert.match(read('index.html'), /js\/services\/music-service\.js/);
assert.match(mapSource, /MusicService\.play\(this, 'music-exploration'/);

const cssSource = read('css/styles.css');
assert.match(cssSource, /width: min\(1232px, 96vw\)/);

const battleSource = read('js/scenes/battle-scene.js');
assert.match(battleSource, /getSelectedAvatar\(\)/);
assert.match(battleSource, /lives <= 0/);
assert.match(battleSource, /OutcomeScene.*victory/);
assert.match(battleSource, /OutcomeScene.*defeat/);
assert.match(battleSource, /configureAnswerShortcuts\(\)/);
assert.match(battleSource, /this\.enemy\.background/);
assert.match(battleSource, /MusicService\.play\(this, this\.enemy\.music/);

const battleBackgrounds = [
  'biblioteca-matematicas.png',
  'laboratorio-programacion.png',
  'oficina-coordinacion.png'
];
battleBackgrounds.forEach((filename) => {
  assert.ok(fs.existsSync(path.join(root, 'assets/batallas', filename)));
  assert.match(bootSource, new RegExp(filename.replace('.', '\\.')));
});

const introSource = read('js/scenes/intro-scene.js');
assert.match(introSource, /COMENZAR  \[ESPACIO\]/);
assert.match(introSource, /fadeOut/);
assert.match(read('js/scenes/outcome-scene.js'), /convertirse en tu carrera/);

const indexSource = read('index.html');
assert.match(indexSource, /js\/scenes\/outcome-scene\.js/);
assert.ok(
  indexSource.indexOf('outcome-scene.js') < indexSource.indexOf('js/main.js'),
  'OutcomeScene debe cargarse antes de main.js'
);

const manifest = JSON.parse(read('manifest.webmanifest'));
assert.strictEqual(manifest.start_url, './');
assert.strictEqual(manifest.scope, './');
assert.strictEqual(manifest.display, 'standalone');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
manifest.icons.forEach((icon) => {
  assert.ok(fs.existsSync(path.join(root, icon.src.replace(/^\.\//, ''))));
});

assert.match(indexSource, /manifest\.webmanifest/);
assert.match(indexSource, /install-app-button/);
assert.match(indexSource, /js\/pwa\.js/);
assert.ok(fs.existsSync(path.join(root, '.nojekyll')));

const serviceWorkerSource = read('service-worker.js');
assert.match(serviceWorkerSource, /profies-pwa-v1/);
assert.match(serviceWorkerSource, /respondToRangeRequest/);
assert.match(read('js/pwa.js'), /serviceWorker\.register\('\.\/service-worker\.js'/);

const shellBlock = serviceWorkerSource.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(shellBlock, 'No se encontró APP_SHELL en el service worker');
const shellPaths = [...shellBlock[1].matchAll(/'(\.\/[^']*)'/g)].map((match) => match[1]);
shellPaths
  .filter((relativePath) => relativePath !== './')
  .forEach((relativePath) => {
    const localPath = path.join(root, relativePath.replace(/^\.\//, ''));
    assert.ok(fs.existsSync(localPath), `Falta el recurso PWA ${relativePath}`);
  });

console.log('OK: flujo, bancos, PWA y recursos principales verificados.');
