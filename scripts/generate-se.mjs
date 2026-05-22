import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(rootDir, "public", "assets");
const sampleRate = 44100;
const tau = Math.PI * 2;

const sounds = [
  {
    name: "se_catch.wav",
    duration: 0.32,
    layers: [
      { type: "sine", start: 0, duration: 0.15, from: 520, to: 920, gain: 0.34 },
      { type: "triangle", start: 0.08, duration: 0.16, from: 1160, to: 1320, gain: 0.18 },
      { type: "sine", start: 0.18, duration: 0.1, from: 760, to: 720, gain: 0.12 },
    ],
  },
  {
    name: "se_rare.wav",
    duration: 0.48,
    layers: [
      { type: "sine", start: 0.01, duration: 0.16, from: 880, to: 980, gain: 0.26 },
      { type: "sine", start: 0.09, duration: 0.18, from: 1320, to: 1480, gain: 0.24 },
      { type: "triangle", start: 0.18, duration: 0.2, from: 1760, to: 2200, gain: 0.2 },
      { type: "sine", start: 0.28, duration: 0.14, from: 2637, to: 2637, gain: 0.11 },
    ],
  },
  {
    name: "se_damage.wav",
    duration: 0.38,
    layers: [
      { type: "sawtooth", start: 0, duration: 0.24, from: 210, to: 86, gain: 0.26 },
      { type: "square", start: 0.04, duration: 0.16, from: 130, to: 104, gain: 0.1 },
      { type: "noise", start: 0.03, duration: 0.2, gain: 0.14, filter: 520 },
    ],
  },
  {
    name: "se_miss.wav",
    duration: 0.34,
    layers: [
      { type: "triangle", start: 0, duration: 0.2, from: 360, to: 180, gain: 0.22 },
      { type: "sine", start: 0.17, duration: 0.1, from: 170, to: 150, gain: 0.12 },
    ],
  },
  {
    name: "se_button.wav",
    duration: 0.22,
    layers: [
      { type: "triangle", start: 0, duration: 0.09, from: 420, to: 650, gain: 0.22 },
      { type: "sine", start: 0.055, duration: 0.09, from: 520, to: 470, gain: 0.14 },
    ],
  },
  {
    name: "se_start.wav",
    duration: 0.54,
    layers: [
      { type: "triangle", start: 0, duration: 0.18, from: 523.25, to: 523.25, gain: 0.22 },
      { type: "triangle", start: 0.11, duration: 0.18, from: 659.25, to: 659.25, gain: 0.22 },
      { type: "triangle", start: 0.22, duration: 0.24, from: 783.99, to: 987.77, gain: 0.2 },
      { type: "sine", start: 0.34, duration: 0.12, from: 1567.98, to: 1567.98, gain: 0.08 },
    ],
  },
  {
    name: "se_gameover.wav",
    duration: 0.58,
    layers: [
      { type: "triangle", start: 0, duration: 0.22, from: 440, to: 392, gain: 0.22 },
      { type: "triangle", start: 0.15, duration: 0.24, from: 330, to: 294, gain: 0.2 },
      { type: "sine", start: 0.32, duration: 0.2, from: 247, to: 220, gain: 0.14 },
    ],
  },
];

const makePrng = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
};

const envelope = (position, duration) => {
  const attack = Math.min(0.018, duration * 0.18);
  const release = Math.min(0.09, duration * 0.42);
  if (position < attack) return position / attack;
  if (position > duration - release) return Math.max(0, (duration - position) / release);
  return 1;
};

const wave = (type, phase) => {
  if (type === "triangle") return 2 * Math.asin(Math.sin(phase)) / Math.PI;
  if (type === "square") return Math.sin(phase) >= 0 ? 1 : -1;
  if (type === "sawtooth") return 2 * (phase / tau - Math.floor(phase / tau + 0.5));
  return Math.sin(phase);
};

const addTone = (samples, layer) => {
  const start = Math.floor(layer.start * sampleRate);
  const length = Math.floor(layer.duration * sampleRate);
  let phase = 0;

  for (let i = 0; i < length && start + i < samples.length; i += 1) {
    const t = i / sampleRate;
    const progress = i / Math.max(1, length - 1);
    const frequency = layer.from * Math.pow(layer.to / layer.from, progress);
    phase += tau * frequency / sampleRate;
    samples[start + i] += wave(layer.type, phase) * layer.gain * envelope(t, layer.duration);
  }
};

const addNoise = (samples, layer, seed) => {
  const random = makePrng(seed);
  const start = Math.floor(layer.start * sampleRate);
  const length = Math.floor(layer.duration * sampleRate);
  let lowPass = 0;
  const smoothing = Math.min(0.98, Math.max(0.2, 1 - (layer.filter ?? 800) / sampleRate));

  for (let i = 0; i < length && start + i < samples.length; i += 1) {
    const t = i / sampleRate;
    const raw = random() * 2 - 1;
    lowPass = lowPass * smoothing + raw * (1 - smoothing);
    samples[start + i] += lowPass * layer.gain * envelope(t, layer.duration);
  }
};

const writeWav = (filePath, samples) => {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-0.98, Math.min(0.98, samples[i]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  writeFileSync(filePath, buffer);
};

mkdirSync(outDir, { recursive: true });

for (const sound of sounds) {
  const samples = new Float32Array(Math.ceil(sound.duration * sampleRate));

  sound.layers.forEach((layer, index) => {
    if (layer.type === "noise") addNoise(samples, layer, index + sound.name.length);
    else addTone(samples, layer);
  });

  writeWav(join(outDir, sound.name), samples);
  console.log(`wrote ${sound.name}`);
}
