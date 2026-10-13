/**
 * 量子化モジュール。
 *
 * -1 ～ +1 の入力範囲を 2^bits 個の等幅区間に分け、
 * 各区間の中央を量子化値とする（mid-rise 型）。
 *
 * 例：3 bit の場合
 *
 * 区間境界：
 * -1.00, -0.75, -0.50, -0.25, 0,
 * +0.25, +0.50, +0.75, +1.00
 *
 * 量子化値：
 * -0.875, -0.625, -0.375, -0.125,
 * +0.125, +0.375, +0.625, +0.875
 */


/**
 * 量子化区間の境界を返す。
 *
 * 3 bitなら9個の境界を返す。
 */
export function getQuantizationBoundaries(
  bits,
  minValue = -1,
  maxValue = 1
) {
  const levelCount = 2 ** bits;
  const step = (maxValue - minValue) / levelCount;

  return Array.from(
    { length: levelCount + 1 },
    (_, index) => minValue + index * step
  );
}


/**
 * 各量子化区間の中央にある
 * 量子化値（代表値）を返す。
 *
 * 3 bitなら8個の値を返す。
 */
export function getQuantizationLevels(
  bits,
  minValue = -1,
  maxValue = 1
) {
  const levelCount = 2 ** bits;
  const step = (maxValue - minValue) / levelCount;

  return Array.from(
    { length: levelCount },
    (_, index) =>
      minValue + (index + 0.5) * step
  );
}


/**
 * 1つの値を量子化する。
 */
export function quantizeValue(
  value,
  bits,
  minValue = -1,
  maxValue = 1
) {
  const levelCount = 2 ** bits;
  const step = (maxValue - minValue) / levelCount;

  // 入力範囲内に制限
  const clamped = Math.min(
    maxValue,
    Math.max(minValue, value)
  );

  // どの量子化区間に入るかを求める
  let level = Math.floor(
    (clamped - minValue) / step
  );

  // maxValueちょうどの場合は
  // levelCountになってしまうので最上位区間に入れる
  if (level >= levelCount) {
    level = levelCount - 1;
  }

  const quantizedValue =
    minValue + (level + 0.5) * step;

  return {
    originalValue: value,
    quantizedValue,
    level,
  };
}


/**
 * 標本点の配列をまとめて量子化する。
 */
export function quantizeSamples(
  samples,
  bits,
  minValue = -1,
  maxValue = 1
) {
  return samples.map((sample) => ({
    ...sample,
    ...quantizeValue(
      sample.value,
      bits,
      minValue,
      maxValue
    ),
  }));
}
