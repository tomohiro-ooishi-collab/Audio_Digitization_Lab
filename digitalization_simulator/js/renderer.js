/**
 * Canvas描画モジュール。
 *
 * 原音
 * 標本点
 * 量子化点
 * 量子化区間
 * 量子化レベル
 * 階段状表示
 *
 * を同じ座標系に描画する。
 */


const COLORS = {

  background: "#ffffff",

  grid: "#e5e7eb",

  axis: "#6b7280",

  signal: "#2563eb",

  sample: "#111827",

  quantized: "#dc2626",

  quantizedStep: "#dc2626",

  // 量子化値（各区間の中央）
  quantizationLevel: "#9ca3af",

  // 量子化区間の境界
  quantizationBoundary: "#d1d5db",

  errorLine: "#f59e0b",

  label: "#4b5563",
};


export function createRenderer(canvas) {

  const context =
    canvas.getContext("2d");


  const margin = {

    left: 58,

    right: 18,

    top: 18,

    bottom: 42,

  };


  function resizeCanvas() {

    const rect =
      canvas.getBoundingClientRect();

    const dpr =
      window.devicePixelRatio || 1;


    canvas.width =
      Math.round(
        rect.width * dpr
      );

    canvas.height =
      Math.round(
        rect.height * dpr
      );


    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    return {

      width: rect.width,

      height: rect.height,

    };
  }


  function draw({

    originalSignal,

    sampledPoints,

    quantizedPoints,

    quantizationLevels,

    quantizationBoundaries,

    duration,

    showQuantizedSteps = true,

  }) {

    const {
      width,
      height
    } = resizeCanvas();


    context.clearRect(
      0,
      0,
      width,
      height
    );


    const plot = {

      left: margin.left,

      right:
        width - margin.right,

      top: margin.top,

      bottom:
        height - margin.bottom,

    };


    const plotWidth =
      plot.right - plot.left;

    const plotHeight =
      plot.bottom - plot.top;


    const amplitudeMin = -1.1;

    const amplitudeMax = 1.1;


    const x = (time) =>

      plot.left +

      (time / duration) *
      plotWidth;


    const y = (value) =>

      plot.bottom -

      (
        (value - amplitudeMin) /
        (amplitudeMax - amplitudeMin)
      ) *

      plotHeight;


    drawBackground(
      context,
      plot
    );


    drawAxes(
      context,
      plot,
      x,
      y,
      duration
    );


    // 量子化区間の境界
    drawQuantizationBoundaries(
      context,
      plot,
      y,
      quantizationBoundaries
    );


    // 各区間の代表値
    drawQuantizationLevels(
      context,
      plot,
      y,
      quantizationLevels
    );


    // 原音
    drawSignal(
      context,
      originalSignal,
      x,
      y
    );


    // 階段表示
    if (showQuantizedSteps) {

      drawQuantizedSteps(
        context,
        quantizedPoints,
        x,
        y,
        duration
      );

    }


    // 標本点
    drawSamples(
      context,
      sampledPoints,
      x,
      y
    );


    // 量子化点
    drawQuantizedPoints(
      context,
      quantizedPoints,
      x,
      y
    );

  }


  return {
    draw
  };
}



/* =====================================================
   背景
===================================================== */

function drawBackground(
  ctx,
  plot
) {

  ctx.save();


  ctx.fillStyle =
    COLORS.background;


  ctx.fillRect(

    plot.left,

    plot.top,

    plot.right -
      plot.left,

    plot.bottom -
      plot.top

  );


  ctx.restore();

}



/* =====================================================
   軸・グリッド
===================================================== */

function drawAxes(
  ctx,
  plot,
  x,
  y,
  duration
) {

  ctx.save();


  ctx.lineWidth = 1;

  ctx.strokeStyle =
    COLORS.grid;

  ctx.fillStyle =
    COLORS.label;

  ctx.font =
    "12px system-ui, sans-serif";


  const durationMs =
    duration * 1000;


  const tickStepMs =

    durationMs <= 10
      ? 1

      : durationMs <= 20
        ? 2

        : 5;


  for (

    let ms = 0;

    ms <=
    durationMs + 1e-9;

    ms += tickStepMs

  ) {

    const px =
      x(ms / 1000);


    ctx.beginPath();

    ctx.moveTo(
      px,
      plot.top
    );

    ctx.lineTo(
      px,
      plot.bottom
    );

    ctx.stroke();


    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "top";


    ctx.fillText(

      `${ms}`,

      px,

      plot.bottom + 8

    );

  }


  [
    -1,
    -0.5,
    0,
    0.5,
    1

  ].forEach(
    (value) => {

      const py =
        y(value);


      ctx.beginPath();

      ctx.moveTo(
        plot.left,
        py
      );

      ctx.lineTo(
        plot.right,
        py
      );

      ctx.stroke();


      ctx.textAlign =
        "right";

      ctx.textBaseline =
        "middle";


      ctx.fillText(

        value.toFixed(
          value === 0
            ? 0
            : 1
        ),

        plot.left - 8,

        py

      );

    }
  );


  // 0軸
  ctx.strokeStyle =
    COLORS.axis;


  ctx.beginPath();

  ctx.moveTo(
    plot.left,
    y(0)
  );

  ctx.lineTo(
    plot.right,
    y(0)
  );

  ctx.stroke();


  ctx.textAlign =
    "right";

  ctx.textBaseline =
    "bottom";


  ctx.fillText(

    "振幅",

    plot.left - 8,

    plot.top + 8

  );


  ctx.textBaseline =
    "top";


  ctx.fillText(

    "時間 [ms]",

    plot.right,

    plot.bottom + 24

  );


  ctx.restore();

}



/* =====================================================
   量子化区間の境界
===================================================== */

function drawQuantizationBoundaries(
  ctx,
  plot,
  y,
  boundaries
) {

  ctx.save();


  ctx.strokeStyle =
    COLORS.quantizationBoundary;

  ctx.lineWidth = 1;

  ctx.setLineDash([]);


  boundaries.forEach(
    (boundary) => {

      const py =
        y(boundary);


      ctx.beginPath();

      ctx.moveTo(
        plot.left,
        py
      );

      ctx.lineTo(
        plot.right,
        py
      );

      ctx.stroke();

    }
  );


  ctx.restore();

}



/* =====================================================
   量子化値
   各区間の中央
===================================================== */

function drawQuantizationLevels(
  ctx,
  plot,
  y,
  levels
) {

  ctx.save();


  ctx.strokeStyle =
    COLORS.quantizationLevel;

  ctx.lineWidth = 1;

  ctx.setLineDash(
    [5, 5]
  );


  levels.forEach(
    (level) => {

      const py =
        y(level);


      ctx.beginPath();

      ctx.moveTo(
        plot.left,
        py
      );

      ctx.lineTo(
        plot.right,
        py
      );

      ctx.stroke();

    }
  );


  ctx.restore();

}



/* =====================================================
   元の正弦波
===================================================== */

function drawSignal(
  ctx,
  points,
  x,
  y
) {

  if (
    points.length === 0
  ) {
    return;
  }


  ctx.save();


  ctx.strokeStyle =
    COLORS.signal;

  ctx.lineWidth = 2.2;

  ctx.setLineDash([]);


  ctx.beginPath();


  ctx.moveTo(

    x(points[0].time),

    y(points[0].value)

  );


  for (

    let i = 1;

    i < points.length;

    i += 1

  ) {

    ctx.lineTo(

      x(points[i].time),

      y(points[i].value)

    );

  }


  ctx.stroke();

  ctx.restore();

}



/* =====================================================
   階段状の量子化値表示
===================================================== */

function drawQuantizedSteps(
  ctx,
  points,
  x,
  y,
  duration
) {

  if (
    points.length === 0
  ) {
    return;
  }


  ctx.save();


  ctx.strokeStyle =
    COLORS.quantizedStep;

  ctx.lineWidth = 2.2;

  ctx.globalAlpha = 0.8;

  ctx.setLineDash([]);


  ctx.beginPath();


  const first =
    points[0];


  ctx.moveTo(

    x(first.time),

    y(
      first.quantizedValue
    )

  );


  for (

    let i = 0;

    i <
    points.length - 1;

    i += 1

  ) {

    const current =
      points[i];

    const next =
      points[i + 1];


    // 次の標本時刻まで
    // 現在の量子化値を保持
    ctx.lineTo(

      x(next.time),

      y(
        current.quantizedValue
      )

    );


    // 次の量子化値へ移動
    ctx.lineTo(

      x(next.time),

      y(
        next.quantizedValue
      )

    );

  }


  const last =
    points[
      points.length - 1
    ];


  if (
    last.time < duration
  ) {

    ctx.lineTo(

      x(duration),

      y(
        last.quantizedValue
      )

    );

  }


  ctx.stroke();

  ctx.restore();

}



/* =====================================================
   標本点
===================================================== */

function drawSamples(
  ctx,
  points,
  x,
  y
) {

  ctx.save();


  ctx.strokeStyle =
    COLORS.sample;

  ctx.fillStyle =
    COLORS.background;

  ctx.lineWidth = 1.8;


  points.forEach(
    (point) => {

      ctx.beginPath();


      ctx.arc(

        x(point.time),

        y(point.value),

        4,

        0,

        Math.PI * 2

      );


      ctx.fill();

      ctx.stroke();

    }
  );


  ctx.restore();

}



/* =====================================================
   量子化後の点
===================================================== */

function drawQuantizedPoints(
  ctx,
  points,
  x,
  y
) {

  ctx.save();


  // 元の標本値から
  // 量子化値までの距離
  ctx.strokeStyle =
    COLORS.errorLine;

  ctx.lineWidth = 1;

  ctx.globalAlpha =
    0.75;


  points.forEach(
    (point) => {

      ctx.beginPath();


      ctx.moveTo(

        x(point.time),

        y(point.value)

      );


      ctx.lineTo(

        x(point.time),

        y(
          point.quantizedValue
        )

      );


      ctx.stroke();

    }
  );


  ctx.globalAlpha = 1;


  ctx.fillStyle =
    COLORS.quantized;


  points.forEach(
    (point) => {

      const px =
        x(point.time);

      const py =
        y(
          point.quantizedValue
        );

      const size = 7;


      ctx.fillRect(

        px - size / 2,

        py - size / 2,

        size,

        size

      );

    }
  );


  ctx.restore();

}
