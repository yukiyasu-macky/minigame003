import { assets } from "../assetsConfig";

let audioContext = null;
let masterGain = null;

const soundBuffers = new Map();
const loadingSounds = new Map();

const soundVolumes = {
  catch: 0.62,
  rare: 0.58,
  damage: 0.55,
  miss: 0.52,
  button: 0.48,
  start: 0.56,
  gameover: 0.56,
};

const soundSources = {
  catch: assets.sounds.catch,
  rare: assets.sounds.rare,
  damage: assets.sounds.damage,
  miss: assets.sounds.miss,
  button: assets.sounds.button,
  start: assets.sounds.start,
  gameover: assets.sounds.gameover,
};

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.82;
    masterGain.connect(audioContext.destination);
  }

  return audioContext;
};

const loadSound = (name) => {
  const context = getAudioContext();
  const source = soundSources[name];

  if (!context || !source) return Promise.resolve(null);
  if (soundBuffers.has(name)) return Promise.resolve(soundBuffers.get(name));
  if (loadingSounds.has(name)) return loadingSounds.get(name);

  const loadPromise = fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load sound: ${name}`);
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
    .then((buffer) => {
      soundBuffers.set(name, buffer);
      return buffer;
    })
    .catch(() => null)
    .finally(() => {
      loadingSounds.delete(name);
    });

  loadingSounds.set(name, loadPromise);
  return loadPromise;
};

export const loadSoundAssets = () =>
  Promise.all(Object.keys(soundSources).map(loadSound)).then(() => undefined);

export const unlockAudio = () => {
  const context = getAudioContext();
  if (!context) return Promise.resolve(false);

  const resumePromise =
    context.state === "suspended"
      ? context.resume().then(() => true).catch(() => false)
      : Promise.resolve(true);

  loadSoundAssets().catch(() => {});
  return resumePromise;
};

export const playSound = (name) => {
  try {
    const context = getAudioContext();
    if (!context || !soundSources[name]) return;

    const playBuffer = (buffer) => {
      if (!buffer || context.state !== "running") return;

      const source = context.createBufferSource();
      const gain = context.createGain();

      source.buffer = buffer;
      gain.gain.value = soundVolumes[name] ?? 0.5;
      source.connect(gain);
      gain.connect(masterGain);
      source.start();
    };

    if (soundBuffers.has(name)) {
      playBuffer(soundBuffers.get(name));
      return;
    }

    loadSound(name).then(playBuffer).catch(() => {});
  } catch {
    // Missing or unsupported SE should never interrupt gameplay.
  }
};
