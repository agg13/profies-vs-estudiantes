const MusicService = (() => {
  let currentSound = null;
  let currentKey = '';

  function destroySound(sound) {
    if (!sound) return;
    if (sound.isPlaying) sound.stop();
    sound.destroy();
  }

  function play(scene, key, options = {}) {
    const {
      volume = 0.14,
      loop = true,
      fadeIn = 700
    } = options;

    if (!scene?.cache?.audio?.exists(key)) return;
    if (currentKey === key && currentSound?.isPlaying) return;

    if (currentSound) destroySound(currentSound);

    const sound = scene.sound.add(key, {
      loop,
      volume: fadeIn > 0 ? 0 : volume
    });
    currentSound = sound;
    currentKey = key;
    sound.play();

    if (fadeIn > 0) {
      scene.tweens.add({
        targets: sound,
        volume,
        duration: fadeIn,
        ease: 'Sine.easeOut'
      });
    }
  }

  function stop(scene, fadeOut = 0) {
    const sound = currentSound;
    currentSound = null;
    currentKey = '';
    if (!sound) return;

    if (fadeOut > 0 && sound.isPlaying && scene?.tweens) {
      scene.tweens.add({
        targets: sound,
        volume: 0,
        duration: fadeOut,
        ease: 'Sine.easeIn',
        onComplete: () => destroySound(sound)
      });
      return;
    }
    destroySound(sound);
  }

  function getCurrentKey() {
    return currentKey;
  }

  return { play, stop, getCurrentKey };
})();
