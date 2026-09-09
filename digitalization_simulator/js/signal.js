/**
 * 正弦波を扱うモジュール。
 * 描画用の高密度な点列を生成する。
 */

export function sineValue(time, frequency, amplitude = 1, phase = 0) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
}

export function generateSineWave({
  frequency,
  duration,
  amplitude = 1,
  phase = 0,
  pointCount = 1600,
}) {
  const points = [];

  for (let i = 0; i <= pointCount; i += 1) {
    const time = (duration * i) / pointCount;
    points.push({
      time,
      value: sineValue(time, frequency, amplitude, phase),
    });
  }

  return points;
}
