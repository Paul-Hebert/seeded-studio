import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt, randomChance } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";
import { randomHsl } from "randomness-helpers";
import { randomHue } from "randomness-helpers";
import { zigZag } from "../../bits/shapes/zig-zag.js";
import FastNoise from "fastnoise-lite";

export const handler = buildFunctionEndpoint((seed) => {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  const hue = randomHue();
  const sat = random(40, 80);
  const light = random(40, 60);

  const centerX = viewBoxWidth / 2;

  const sideSize = randomInt(300, 400);

  const bottomY = viewBoxHeight - viewBoxHeight / 10;
  const topY = bottomY - sideSize;

  const numberOfLines = randomInt(7, 12);
  const spaceBetweenLines = sideSize / numberOfLines;

  const sideAngle = randomInt(20, 30);

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content:
      buildFrontLines({
        sideSize,
        sideAngle,
        topY,
        bottomY,
        spaceBetweenLines,
        baseColor: randomHsl({ h: hue, s: sat, l: light }),
        centerX,
      }) +
      blockers({ centerX, sideAngle, sideSize, bottomY, topY }) +
      centerLine({
        centerX,
        topY,
        bottomY,
        baseColor: randomHsl({ h: hue + 120, s: sat, l: light }),
      }) +
      buildTopLines({
        seed,
        sideSize,
        sideAngle,
        numberOfLines,
        spaceBetweenLines,
        centerX,
        topY,
        hue,
        sat,
        light,
      }),
  });
});

function buildFrontLines({
  sideSize,
  sideAngle,
  topY,
  bottomY,
  spaceBetweenLines,
  baseColor,
  centerX,
}) {
  const lines = [];

  const baseAngle = 90 + sideAngle;
  const flippedAngle = 360 - baseAngle;

  for (let y = topY; Math.round(y) <= bottomY; y += spaceBetweenLines) {
    const centerPoint = {
      x: centerX,
      y,
    };
    const startPoint = angledPositionFromPoint({
      angle: baseAngle,
      distance: sideSize,
      point: centerPoint,
    });
    const endPoint = angledPositionFromPoint({
      angle: flippedAngle,
      distance: sideSize,
      point: centerPoint,
    });
    lines.push(`
        <path 
          d="
            M${startPoint.x} ${startPoint.y}
            L${centerPoint.x} ${centerPoint.y}
            L${endPoint.x} ${endPoint.y}
          "
          fill="none"
          stroke="${baseColor}" />
      `);
  }

  return lines.join("");
}

function blockers({ centerX, sideAngle, sideSize, bottomY, topY }) {
  const baseAngle = 90 + sideAngle;
  const flippedAngle = 360 - baseAngle;

  const centerPoint = {
    x: centerX,
    y: topY,
  };
  const startPoint = angledPositionFromPoint({
    angle: baseAngle,
    distance: sideSize,
    point: centerPoint,
  });
  const endPoint = angledPositionFromPoint({
    angle: flippedAngle,
    distance: sideSize,
    point: centerPoint,
  });
  const startBottomPoint = {
    x: startPoint.x,
    y: startPoint.y + sideSize + 2,
  };
  const endBottomPoint = {
    x: endPoint.x,
    y: endPoint.y + sideSize + 2,
  };
  const centerBottomPoint = {
    x: centerX,
    y: bottomY + 2,
  };

  return `
    <path 
      d="
        M${centerBottomPoint.x} ${centerBottomPoint.y}
        L${startPoint.x} ${startPoint.y}
        L${startBottomPoint.x} ${startBottomPoint.y}
        Z
      "
      fill="#fff"
      stroke="#fff"
    />
    <path 
      d="
        M${centerBottomPoint.x} ${centerBottomPoint.y}
        L${endPoint.x} ${endPoint.y}
        L${endBottomPoint.x} ${endBottomPoint.y}
        Z
      "
      fill="#fff"
    />
  `;
}

function centerLine({ centerX, topY, bottomY, baseColor }) {
  return `
      <line
        x1="${centerX}" 
        x2="${centerX}" 
        y1="${topY}" 
        y2="${bottomY}"
        stroke="${baseColor}" />
      `;
}

function buildTopGrid({ seed, numberOfLines, sideSize }) {
  const noise = new FastNoise();
  noise.SetNoiseType(FastNoise.NoiseType.OpenSimplex2);
  noise.SetSeed(seed);
  noise.SetFrequency(15);

  const points = [];

  for (let x = 0; x < numberOfLines; x++) {
    const row = [];

    for (let y = 0; y < numberOfLines; y++) {
      const modifier = (x > numberOfLines / 2 ? numberOfLines - x : x) + 1;
      const altModifier = (y > numberOfLines / 2 ? numberOfLines - y : y) + 1;

      row.push(
        ((modifier * altModifier) / numberOfLines) *
          (1 + noise.GetNoise(x / numberOfLines, y / numberOfLines)) *
          30
      );
    }

    points.push(row);
  }

  return points;
}

function buildTopLines({
  seed,
  sideSize,
  numberOfLines,
  spaceBetweenLines,
  sideAngle,
  centerX,
  topY,
  hue,
  sat,
  light,
}) {
  const grid = buildTopGrid({ seed, numberOfLines, sideSize });

  const centerPoint = {
    x: centerX,
    y: topY,
  };

  const baseAngle = 90 + sideAngle;
  const flippedAngle = 360 - baseAngle;

  const lines = [];

  for (let depth = grid.length; depth > 0; depth--) {
    const lineSettings = {
      sideSize,
      spaceBetweenLines,
      depth,
      centerPoint,
      grid,
      baseAngle,
      flippedAngle,
      baseColor: randomHsl({ h: hue + 120, s: sat, l: light }),
    };
    const reversedSettings = {
      ...lineSettings,
      baseAngle: flippedAngle,
      flippedAngle: baseAngle,
      reversed: true,
      baseColor: randomHsl({ h: hue - 120, s: sat, l: light }),
    };
    lines.push(`
      <g class="top-layer">
      ${
        // buildTopLine({ ...lineSettings, isStroked: false }) +
        // buildTopLine({ ...reversedSettings, isStroked: false }) +
        buildTopLine(lineSettings) + buildTopLine(reversedSettings)
      }
      </g>
    `);
  }

  return lines.join("");
}

function buildTopLine({
  sideSize,
  baseAngle,
  spaceBetweenLines,
  depth,
  centerPoint,
  grid,
  flippedAngle,
  baseColor,
  reversed = false,
  isStroked = true,
}) {
  const startPoint = angledPositionFromPoint({
    angle: baseAngle,
    distance: depth * spaceBetweenLines,
    point: centerPoint,
  });

  const endPoint = angledPositionFromPoint({
    angle: flippedAngle,
    distance: sideSize,
    point: startPoint,
  });

  const points = [];

  for (let pointCount = 0; pointCount < grid.length; pointCount++) {
    const point = angledPositionFromPoint({
      // TODO: should htis flip?
      angle: flippedAngle,
      point: startPoint,
      distance: (pointCount + 1) * spaceBetweenLines,
    });

    const mod = reversed
      ? grid[pointCount][depth - 1]
      : grid[depth - 1][pointCount];

    point.y -= mod;

    points.push(point);
  }

  const styles = isStroked
    ? `stroke="${baseColor}" fill="none"`
    : 'fill="#fff"';

  // let pathData = spline([startPoint, ...points]);
  let pathData = zigZag([startPoint, ...points]);

  if (isStroked) {
    const bottomPoint = {
      x: centerPoint.x,
      y: centerPoint.y + sideSize,
    };
    pathData = `M${bottomPoint.x} ${bottomPoint.y} L${pathData.slice(1)}`;
    // pathData = `
    //   M${bottomPoint.x} ${bottomPoint.y}
    //   Q${startPoint.x} ${bottomPoint.y} ${pathData.slice(1)}
    // `;
  }

  return `
    
    <path
      class="top"
      d="${pathData}"
      ${styles}
    />
  `;
}
