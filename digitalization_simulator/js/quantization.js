/**
 * 量子化モジュール。
 * -1 ～ +1 の振幅範囲を 2^bits 個の量子化レベルに分け、
 * 各標本値を最も近いレベルへ丸める。
 */

export function getQuantizationLevels(bits, minValue = -1, maxValue = 1) {
  const levelCount = 2 ** bits;

  if (levelCount < 2) {
    return [minValue];
  }

  const step = (maxValue - minValue) / (levelCount - 1);

  return Array.from(
    { length: levelCount },
    (_, index) => minValue + index * step
  );
}

export function quantizeValue(
  value,
  bits,
  minValue = -1,
  maxValue = 1
) {
  const levelCount = 2 ** bits;
  const clamped = Math.min(maxValue, Math.max(minValue, value));
  const normalized = (clamped - minValue) / (maxValue - minValue);
  const level = Math.round(normalized * (levelCount - 1));
  const quantizedValue =
    minValue +
    (level / (levelCount - 1)) * (maxValue - minValue);

  return {
    originalValue: value,
    quantizedValue,
    level,
  };
}

export function quantizeSamples(
  samples,
  bits,
  minValue = -1,
  maxValue = 1
) {
  return samples.map((sample) => ({
    ...sample,
    ...quantizeValue(sample.value, bits, minValue, maxValue),
  }));
}
