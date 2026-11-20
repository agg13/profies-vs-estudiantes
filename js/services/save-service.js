// La versión del mapa utiliza coordenadas nuevas y no debe mezclar guardados
// de los prototipos anteriores.
const SAVE_KEY = 'profiesVsEstudiantesSaveV4';
const SAVE_VERSION = 4;

const SaveService = {
  hasSave() {
    // DONE SEMANA 2.2A: detección segura de una partida existente.
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (error) {
      console.warn('No fue posible consultar el guardado.', error);
      return false;
    }
  },

  save() {
    // DONE SEMANA 2.2B: serialización versionada del estado completo.
    try {
      const payload = {
        version: SAVE_VERSION,
        savedAt: new Date().toISOString(),
        state: GAME_STATE
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('No fue posible guardar la partida.', error);
      return false;
    }
  },

  load() {
    // DONE SEMANA 2.2C: validación y recuperación de estado, posición y listas.
    try {
      const savedText = localStorage.getItem(SAVE_KEY);
      if (!savedText) return false;

      const payload = JSON.parse(savedText);
      const savedState = payload.state || payload;
      if (!savedState || typeof savedState !== 'object') return false;

      resetGameState();
      Object.assign(GAME_STATE, savedState);
      GAME_STATE.position = {
        ...DEFAULT_GAME_STATE.position,
        ...(savedState.position || {})
      };

      const arrayProperties = [
        'inventory',
        'collectedItems',
        'defeatedEnemies',
        'activeQuests',
        'completedQuests'
      ];
      arrayProperties.forEach((property) => {
        if (!Array.isArray(GAME_STATE[property])) GAME_STATE[property] = [];
      });

      if (!CAREER_CATALOG[GAME_STATE.career]) GAME_STATE.career = '';
      if (!AVATAR_CATALOG[GAME_STATE.avatar]) GAME_STATE.avatar = 'masculino';
      GAME_STATE.concentration = Math.max(
        0,
        Math.min(GAME_STATE.concentration, GAME_STATE.maxConcentration)
      );
      return Boolean(GAME_STATE.playerName && GAME_STATE.career);
    } catch (error) {
      console.error('La partida guardada no pudo recuperarse.', error);
      return false;
    }
  },

  clear() {
    // DONE SEMANA 2.2D: eliminación controlada del guardado.
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (error) {
      console.error('No fue posible eliminar la partida.', error);
      return false;
    }
  },

  newGame() {
    // DONE SEMANA 2.2E: borrado del guardado y restauración del estado inicial.
    const cleared = this.clear();
    resetGameState();
    return cleared;
  }
};
