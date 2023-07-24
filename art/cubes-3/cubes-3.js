import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt, randomChance } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";
import { randomHsl } from "randomness-helpers";
import { randomHue } from "randomness-helpers";
import FastNoise from "fastnoise-lite";
import { randomItemInArray } from "randomness-helpers";
import { spiralPoints } from "../../bits/shapes/spiral-points.js";
import { inkscapeLayer } from "../../helpers/inkscape-layer.js";

export const handler = buildFunctionEndpoint((seed) => {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  const hue = randomHue();

  const baseColor = "brown";
  const waterColor = "blue";
  const plantColor = "green";

  const centerX = viewBoxWidth / 2;

  const sideSize = randomInt(300, 400);
  const numberOfLines = randomInt(50, 100);
  const spaceBetweenLines = sideSize / numberOfLines;

  const startY = viewBoxHeight - viewBoxHeight / 10;
  const topY = startY - sideSize;

  const sideAngle = randomInt(20, 30);

  const landNoise = new FastNoise();
  const noiseType = randomItemInArray([
    "OpenSimplex2",
    "OpenSimplex2S",
    "Cellular",
    "Perlin",
    // "ValueCubic",
    // "Value",
  ]);
  landNoise.SetNoiseType(FastNoise.NoiseType[noiseType]);
  landNoise.SetSeed(seed);
  landNoise.SetFrequency(0.01);

  const baseAddition = noiseType === "Cellular" ? -20 : -50;
  const comboModDivider = noiseType === "Cellular" ? 300 : 600;

  const waterNoise = new FastNoise();
  waterNoise.SetNoiseType(FastNoise.NoiseType.Cellular);
  waterNoise.SetSeed(seed);
  waterNoise.SetFrequency(10);

  const topLines = [];

  for (let distance = sideSize; distance >= 0; distance -= spaceBetweenLines) {
    const landStartPoint = angledPositionFromPoint({
      angle: 90 + sideAngle,
      point: {
        x: centerX,
        y: topY,
      },
      distance,
    });

    const landEndPoint = angledPositionFromPoint({
      angle: 360 - 90 - sideAngle,
      point: landStartPoint,
      distance: sideSize,
    });

    let landPoints = [];

    for (
      let altDistance = spaceBetweenLines;
      altDistance < sideSize;
      altDistance += spaceBetweenLines
    ) {
      const point = angledPositionFromPoint({
        angle: 360 - 90 - sideAngle,
        point: landStartPoint,
        distance: altDistance,
      });
      const modifier =
        (distance > sideSize / 2 ? sideSize - distance : distance) - 10;
      const altModifier =
        (altDistance > sideSize / 2 ? sideSize - altDistance : altDistance) -
        10;

      const comboModifier =
        ((modifier + altModifier) * (modifier + altModifier)) / comboModDivider;

      const randomizedModifier =
        baseAddition +
        comboModifier +
        comboModifier * landNoise.GetNoise(distance, altDistance);
      point.y -= randomizedModifier;
      point.mod = randomizedModifier;

      landPoints.push(point);
    }

    let waterPoints = [];

    for (
      let altDistance = spaceBetweenLines;
      altDistance < sideSize;
      altDistance += spaceBetweenLines
    ) {
      const point = angledPositionFromPoint({
        angle: 360 - 90 - sideAngle,
        point: landStartPoint,
        distance: altDistance,
      });
      point.y -= (1 + waterNoise.GetNoise(distance, altDistance)) * 5;

      waterPoints.push(point);
    }

    topLines.push(
      inkscapeLayer(
        "0-water",
        `
          <path 
            d="${spline([landStartPoint, ...waterPoints, landEndPoint])}"
            stroke="${waterColor}" fill="none"
          />
        `
      )
    );
    topLines.push(
      inkscapeLayer(
        "1-land",
        `   
            <path
              d="${spline([landStartPoint, ...landPoints, landEndPoint])}"
              fill="#fff"
              stroke="${baseColor}"
            />;
          `
      )
    );

    landPoints.forEach((point) => {
      if (point.mod > 0 && randomChance((30 - point.mod) / 10)) {
        topLines.push(plant(point, plantColor));
      }
    });
  }

  function frontLines() {
    const centerLine = `
      <line
        x1="${centerX}" 
        x2="${centerX}" 
        y1="${topY}" 
        y2="${startY}"
        stroke="${waterColor}" />
      `;
    const rightLine = `
      <line
        x1="${topRightPoint.x}" 
        x2="${topRightPoint.x}" 
        y1="${topRightPoint.y}" 
        y2="${topRightPoint.y + sideSize}"
        stroke="${waterColor}" />
    `;
    const leftLine = `
      <line
        x1="${topLeftPoint.x}" 
        x2="${topLeftPoint.x}" 
        y1="${topLeftPoint.y}" 
        y2="${topLeftPoint.y + sideSize}"
        stroke="${waterColor}" />
    `;

    return centerLine + rightLine + leftLine;
  }

  function backLeftLine() {
    const topTopPoint = angledPositionFromPoint({
      angle: 90 + sideAngle,
      distance: sideSize,
      point: topLeftPoint,
    });

    return `
      <line
        x1="${topLeftPoint.x}" 
        x2="${topTopPoint.x}" 
        y1="${topLeftPoint.y}" 
        y2="${topTopPoint.y}"
        stroke="${waterColor}" />
    `;
  }

  const topRightPoint = angledPositionFromPoint({
    angle: 90 + sideAngle,
    distance: sideSize,
    point: { x: centerX, y: topY },
  });
  const topLeftPoint = angledPositionFromPoint({
    angle: 360 - (90 + sideAngle),
    distance: sideSize,
    point: { x: centerX, y: topY },
  });

  const leftSideLines = buildSide();
  const rightSideLines = buildSide(true);

  function buildSide(reverse = false) {
    const lines = [];

    const baseAngle = 90 + sideAngle;
    const calculatedAngle = reverse ? baseAngle : 360 - baseAngle;

    for (let y = startY; Math.round(y) >= topY; y -= spaceBetweenLines) {
      const startPoint = {
        x: centerX,
        y,
      };
      const endPoint = angledPositionFromPoint({
        angle: calculatedAngle,
        distance: sideSize,
        point: startPoint,
      });
      lines.push(`
        <line 
          x1="${startPoint.x}"
          y1="${startPoint.y}"
          x2="${endPoint.x}"
          y2="${endPoint.y}"
          fill="none"
          stroke="${waterColor}" />
      `);
    }

    return lines;
  }

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content:
      backLeftLine() +
      topLines.join("\n") +
      `
      <path 
        fill="#fff"
        d="
          M${centerX}, ${topY}
          L${centerX} ${topY + sideSize}
          L${topLeftPoint.x} ${topLeftPoint.y + sideSize}
          L${topLeftPoint.x} ${topLeftPoint.y}
          Z
        "
      />
      <path 
        fill="#fff"
        d="
          M${centerX}, ${topY}
          L${centerX} ${topY + sideSize}
          L${topRightPoint.x} ${topRightPoint.y + sideSize}
          L${topRightPoint.x} ${topRightPoint.y}
          Z
        "
      />
      ` +
      leftSideLines.join("\n") +
      rightSideLines.join("\n") +
      frontLines(),
  });
});

function plant({ x, y }, plantColor) {
  const plantLines = [];

  for (let i = 0; i < randomInt(1, 5); i++) {
    plantLines.push(`
    <line 
      x1="${x + random(-3, 3)}"
      x2="${x + random(-10, 10)}"
      y1="${y}"
      y2="${y - random(10, 20)}"
      stroke="${plantColor}"
    />
  `);
  }

  const spiralR = random(3, 8);

  return inkscapeLayer(
    "2-plant",
    `
    <circle
      cx="${x + random(-2, 2)}"
      cy="${y}"
      r="${spiralR}"
      fill="#fff"
      stroke="${plantColor}" />

    <path
      d="${spline(spiralPoints({ x, y, r: spiralR }))}"
      fill="none"
      stroke="${plantColor}" />
  ` + plantLines.join("\n")
  );
}
