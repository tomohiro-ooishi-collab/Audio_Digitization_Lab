/**
 * UI入力をまとめて扱うモジュール。
 */

export function createControls(onChange) {
  const elements = {
    signalFrequency: document.querySelector("#signalFrequency"),
    samplingFrequency: document.querySelector("#samplingFrequency"),
    quantizationBits: document.querySelector("#quantizationBits"),
    signalFrequencyValue: document.querySelector("#signalFrequencyValue"),
    samplingFrequencyValue: document.querySelector("#samplingFrequencyValue"),
    quantizationBitsValue: document.querySelector("#quantizationBitsValue"),
  };

  function getValues() {
    return {
      signalFrequency: Number(elements.signalFrequency.value),
      samplingFrequency: Number(elements.samplingFrequency.value),
      quantizationBits: Number(elements.quantizationBits.value),
    };
  }

  function updateOutputs() {
    const values = getValues();
    elements.signalFrequencyValue.textContent =
      `${values.signalFrequency} Hz`;
    elements.samplingFrequencyValue.textContent =
      `${values.samplingFrequency} Hz`;

    const levelCount = 2 ** values.quantizationBits;
    elements.quantizationBitsValue.textContent =
      `${values.quantizationBits} bit（${levelCount}段階）`;
  }

  function handleInput() {
    updateOutputs();
    onChange(getValues());
  }

  [
    elements.signalFrequency,
    elements.samplingFrequency,
    elements.quantizationBits,
  ].forEach((element) => {
    element.addEventListener("input", handleInput);
  });

  updateOutputs();

  return {
    getValues,
  };
}
