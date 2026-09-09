/**
 * 標本化モジュール。
 * 指定した標本化周波数の時刻だけ、元の信号から値を取り出す。
 */

export function sampleSignal({
  valueAt,
  samplingFrequency,
  duration,
}) {
  if (samplingFrequency <= 0) {
    throw new Error("samplingFrequency must be greater than 0.");
  }

  const interval = 1 / samplingFrequency;
  const samples = [];

  // 浮動小数点誤差で終端を取りこぼさないよう、標本番号から時刻を計算する。
  const lastIndex = Math.floor(duration * samplingFrequency + 1e-9);

  for (let index = 0; index <= lastIndex; index += 1) {
    const time = index * interval;
    samples.push({
      index,
      time,
      value: valueAt(time),
    });
  }

  return samples;
}
