const RetroAudio = (() => {
  let audioContext = null;
  let masterGain = null;
  let muted = false;

  function getContext() {
    if (audioContext) return audioContext;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(audioContext.destination);
    return audioContext;
  }

  function unlock() {
    const context = getContext();
    if (context?.state === 'suspended') context.resume();
  }

  function tone({
    frequency,
    endFrequency = frequency,
    duration = 0.08,
    delay = 0,
    type = 'square',
    volume = 0.18
  }) {
    if (muted) return;
    const context = getContext();
    if (!context || !masterGain) return;
    unlock();

    const startsAt = context.currentTime + delay;
    const endsAt = startsAt + duration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startsAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency),
      endsAt
    );
    gain.gain.setValueAtTime(0.001, startsAt);
    gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, endsAt);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startsAt);
    oscillator.stop(endsAt + 0.01);
  }

  function beep() {
    tone({ frequency: 440, endFrequency: 520, duration: 0.06, volume: 0.12 });
  }

  function coin() {
    tone({ frequency: 880, duration: 0.07, volume: 0.15 });
    tone({ frequency: 1320, duration: 0.12, delay: 0.07, volume: 0.16 });
  }

  function hit() {
    tone({
      frequency: 170,
      endFrequency: 55,
      duration: 0.16,
      type: 'sawtooth',
      volume: 0.2
    });
  }

  function confirm() {
    tone({ frequency: 523.25, duration: 0.08, volume: 0.12 });
    tone({ frequency: 659.25, duration: 0.08, delay: 0.07, volume: 0.12 });
    tone({ frequency: 783.99, duration: 0.13, delay: 0.14, volume: 0.14 });
  }

  function alert() {
    tone({ frequency: 260, endFrequency: 190, duration: 0.12, volume: 0.15 });
    tone({ frequency: 260, endFrequency: 190, duration: 0.12, delay: 0.15, volume: 0.15 });
  }

  function battleStart() {
    tone({ frequency: 196, duration: 0.1, volume: 0.13 });
    tone({ frequency: 261.63, duration: 0.1, delay: 0.1, volume: 0.13 });
    tone({ frequency: 392, duration: 0.18, delay: 0.2, volume: 0.16 });
  }

  function victory() {
    tone({ frequency: 523.25, duration: 0.1, volume: 0.12 });
    tone({ frequency: 659.25, duration: 0.1, delay: 0.1, volume: 0.12 });
    tone({ frequency: 783.99, duration: 0.1, delay: 0.2, volume: 0.13 });
    tone({ frequency: 1046.5, duration: 0.25, delay: 0.3, volume: 0.16 });
  }

  function setMuted(value) {
    muted = Boolean(value);
  }

  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  return { beep, coin, hit, confirm, alert, battleStart, victory, unlock, setMuted };
})();
