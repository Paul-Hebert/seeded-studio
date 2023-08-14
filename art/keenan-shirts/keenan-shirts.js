import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";
import {
  randomHsl,
  random,
  randomItemInArray,
  randomHue,
  randomInt,
} from "randomness-helpers";
import FastNoise from "fastnoise-lite";
import { inkscapeLayer } from "../../helpers/inkscape-layer.js";

export const handler = buildFunctionEndpoint((seed) => {
  const viewBoxWidth = 4500;
  const viewBoxHeight = 3000;

  const hue = randomHue();

  const baseColor = randomHsl({ h: hue, s: [40, 80], l: [70, 90] });
  const fillColor = randomHsl({ h: hue, s: [10, 30], l: [5, 15] });

  const sideSize = 5000 / 12;
  const numberOfLines = 40;
  const sideAngle = 30;

  let startPoint = {
    x: viewBoxWidth / 2,
    y: sideSize * 2.5,
  };

  const cubes = [];

  for (rowCount = 0; rowCount < 4; rowCount++) {
    for (columnCount = 0; columnCount < 4; columnCount++) {
      let point = angledPositionFromPoint({
        angle: 90 - sideAngle,
        point: startPoint,
        distance: rowCount * sideSize * 1.25,
      });
      point = angledPositionFromPoint({
        angle: 270 + sideAngle,
        point,
        distance: columnCount * sideSize * 1.25,
      });
      cubes.push(
        buildCube({
          centerX: point.x,
          startY: point.y, // + 30 * Math.sin(10 * cubeCount),
          baseColor,
          sideSize,
          numberOfLines,
          sideAngle,
          seed,
          fillColor,
        })
      );
    }
  }

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content:
      `<rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxWidth}" fill="${fillColor}" />` +
      cubes.join(""),
  });
});

function buildCube({
  centerX,
  startY,
  baseColor,
  sideSize,
  numberOfLines,
  sideAngle,
  fillColor,
}) {
  const spaceBetweenLines = sideSize / numberOfLines;

  const topY = startY - sideSize;

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
  const topTopPoint = angledPositionFromPoint({
    angle: 90 + sideAngle,
    distance: sideSize,
    point: topLeftPoint,
  });

  const leftSideLines = buildSide();
  const rightSideLines = buildSide(true);
  const topLines = topSide();

  const cube =
    filledBack() +
    backLeftLine() +
    topLines.join("\n") +
    leftSideLines.join("\n") +
    rightSideLines.join("\n") +
    frontLines();

  return inkscapeLayer(
    "cube",
    `
      <g fill="${fillColor}" stroke="${fillColor}" stroke-width="30">${cube}</g>
      <g fill="${fillColor}" stroke="${baseColor}">${cube}</g>
    `
  );

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
          fill="none"/>
      `);
    }

    return lines;
  }

  function topSide() {
    const noise = new FastNoise();
    noise.SetNoiseType(
      FastNoise.NoiseType[
        randomItemInArray([
          "OpenSimplex2",
          "OpenSimplex2S",
          "Cellular",
          "Perlin",
          // "ValueCubic",
          // "Value",
        ])
      ]
    );
    noise.SetSeed(random());
    noise.SetFrequency(0.01);

    const lines = [];
    for (
      let distance = sideSize;
      distance >= 0;
      distance -= spaceBetweenLines
    ) {
      const startPoint = angledPositionFromPoint({
        angle: 90 + sideAngle,
        point: {
          x: centerX,
          y: topY,
        },
        distance,
      });

      const endPoint = angledPositionFromPoint({
        angle: 360 - 90 - sideAngle,
        point: startPoint,
        distance: sideSize,
      });

      let points = [];

      for (
        let altDistance = spaceBetweenLines;
        altDistance < sideSize;
        altDistance += spaceBetweenLines
      ) {
        const point = angledPositionFromPoint({
          angle: 360 - 90 - sideAngle,
          point: startPoint,
          distance: altDistance,
        });
        const modifier =
          (distance > sideSize / 2 ? sideSize - distance : distance) + 1;
        const altModifier =
          (altDistance > sideSize / 2 ? sideSize - altDistance : altDistance) +
          1;

        const comboModifier =
          ((modifier + altModifier) * (modifier + altModifier)) / 1000;

        const randomizedModifier =
          comboModifier * (1 + noise.GetNoise(distance, altDistance));
        point.y -= randomizedModifier;

        points.push(point);
      }

      lines.push(`
        <path 
          d="${spline([startPoint, ...points, endPoint])}"
          fill="${fillColor}"/>
      `);
    }

    return lines;
  }

  function frontLines() {
    const centerLine = `
      <line
        x1="${centerX}" 
        x2="${centerX}" 
        y1="${topY}" 
        y2="${startY}" />
      `;
    const rightLine = `
      <line
        x1="${topRightPoint.x}" 
        x2="${topRightPoint.x}" 
        y1="${topRightPoint.y}" 
        y2="${topRightPoint.y + sideSize}" />
    `;
    const leftLine = `
      <line
        x1="${topLeftPoint.x}" 
        x2="${topLeftPoint.x}" 
        y1="${topLeftPoint.y}" 
        y2="${topLeftPoint.y + sideSize}" />
    `;

    return centerLine + rightLine + leftLine;
  }

  function backLeftLine() {
    return `
      <line
        x1="${topLeftPoint.x}" 
        x2="${topTopPoint.x}" 
        y1="${topLeftPoint.y}" 
        y2="${topTopPoint.y}" />
    `;
  }

  function filledBack() {
    return `      
      <path 
        fill="${fillColor}"
        d="
          M${centerX}, ${topTopPoint.y}
          L${topLeftPoint.x} ${topLeftPoint.y}
          L${topLeftPoint.x} ${topLeftPoint.y + sideSize}
          L${centerX}, ${topY + sideSize}
          L${topRightPoint.x} ${topRightPoint.y + sideSize}
          L${topRightPoint.x} ${topRightPoint.y}
          Z
        "
      />
      `;
  }
}
