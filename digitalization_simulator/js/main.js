import { generateSineWave, sineValue } from "./signal.js";
import { sampleSignal } from "./sampling.js";
import {
  getQuantizationLevels,
  quantizeSamples,
} from "./quantization.js";
import { createRenderer } from "./renderer.js";
import { createControls } from "./controls.js";

const canvas = document.querySelector("#waveCanvas");
const renderer = createRenderer(canvas);

const samplesPerCycleElement =
  document.querySelector("#samplesPerCycle");
const quantizationLevelsElement =
  document.querySelector("#quantizationLevels");

// 波形を比較しやすいよう、表示時間はまず 10 ms に固定する。
const DURATION = 0.010;
const AMPLITUDE = 1;

let currentSettings = null;

function update(settings) {
  currentSettings = settings;

  const originalSignal = generateSineWave({
    frequency: settings.signalFrequency,
    duration: DURATION,
    amplitude: AMPLITUDE,
  });

  const sampledPoints = sampleSignal({
    samplingFrequency: settings.samplingFrequency,
    duration: DURATION,
    valueAt: (time) =>
      sineValue(time, settings.signalFrequency, AMPLITUDE),
  });

  const quantizedPoints = quantizeSamples(
    sampledPoints,
    settings.quantizationBits,
    -AMPLITUDE,
    AMPLITUDE
  );

  const quantizationLevels = getQuantizationLevels(
    settings.quantizationBits,
    -AMPLITUDE,
    AMPLITUDE
  );

  renderer.draw({
    originalSignal,
    sampledPoints,
    quantizedPoints,
    quantizationLevels,
    duration: DURATION,
  });

  updateSummary(settings);
}

function updateSummary(settings) {
  const samplesPerCycle =
    settings.samplingFrequency / settings.signalFrequency;

  samplesPerCycleElement.textContent =
    `1周期あたりの標本数：約 ${samplesPerCycle.toFixed(2)} 個`;

  quantizationLevelsElement.textContent =
    `量子化レベル数：${2 ** settings.quantizationBits} 段階`;
}

const controls = createControls(update);

// 初期表示
update(controls.getValues());

// ウィンドウサイズが変わったら同じ状態で再描画する。
window.addEventListener("resize", () => {
  if (currentSettings) {
    update(currentSettings);
  }
});
