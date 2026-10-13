import {
  generateSineWave,
  sineValue
} from "./signal.js";

import {
  sampleSignal
} from "./sampling.js";

import {
  getQuantizationLevels,
  getQuantizationBoundaries,
  quantizeSamples,
} from "./quantization.js";

import {
  createRenderer
} from "./renderer.js";

import {
  createControls
} from "./controls.js";


const canvas =
  document.querySelector("#waveCanvas");

const renderer =
  createRenderer(canvas);


const samplesPerCycleElement =
  document.querySelector("#samplesPerCycle");

const quantizationLevelsElement =
  document.querySelector("#quantizationLevels");


// 表示時間：10 ms
const DURATION = 0.010;

// 原音の最大振幅
const AMPLITUDE = 1;


let currentSettings = null;


function update(settings) {

  currentSettings = settings;


  // -----------------------------
  // 元の正弦波
  // -----------------------------

  const originalSignal =
    generateSineWave({
      frequency: settings.signalFrequency,
      duration: DURATION,
      amplitude: AMPLITUDE,
    });


  // -----------------------------
  // 標本化
  // -----------------------------

  const sampledPoints =
    sampleSignal({
      samplingFrequency:
        settings.samplingFrequency,

      duration: DURATION,

      valueAt: (time) =>
        sineValue(
          time,
          settings.signalFrequency,
          AMPLITUDE
        ),
    });


  // -----------------------------
  // 量子化
  // -----------------------------

  const quantizedPoints =
    quantizeSamples(
      sampledPoints,
      settings.quantizationBits,
      -AMPLITUDE,
      AMPLITUDE
    );


  // 量子化後に取り得る値
  const quantizationLevels =
    getQuantizationLevels(
      settings.quantizationBits,
      -AMPLITUDE,
      AMPLITUDE
    );


  // 量子化区間の境界
  const quantizationBoundaries =
    getQuantizationBoundaries(
      settings.quantizationBits,
      -AMPLITUDE,
      AMPLITUDE
    );


  // -----------------------------
  // 描画
  // -----------------------------

  renderer.draw({
    originalSignal,
    sampledPoints,
    quantizedPoints,
    quantizationLevels,
    quantizationBoundaries,
    duration: DURATION,
  });


  updateSummary(settings);
}


function updateSummary(settings) {

  const samplesPerCycle =
    settings.samplingFrequency /
    settings.signalFrequency;


  samplesPerCycleElement.textContent =
    `1周期あたりの標本数：約 ${samplesPerCycle.toFixed(2)} 個`;


  quantizationLevelsElement.textContent =
    `量子化レベル数：${2 ** settings.quantizationBits} 段階`;
}


const controls =
  createControls(update);


// 初期表示
update(
  controls.getValues()
);


// ウィンドウサイズ変更時に再描画
window.addEventListener(
  "resize",
  () => {

    if (currentSettings) {
      update(currentSettings);
    }

  }
);
