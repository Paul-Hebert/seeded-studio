import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt, randomChance } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";
import { randomHsl } from "randomness-helpers";
import { randomHue } from "randomness-helpers";
import { spiralPoints } from "../../bits/shapes/spiral-points.js";

export const handler = buildFunctionEndpoint(() => {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  const hue = randomHue();

  const baseColor = randomHsl({ h: hue, s: [20, 40], l: [40, 60] });

  const centerX = viewBoxWidth / 2;

  const sideSize = randomInt(300, 400);
  const numberOfLines = randomInt(20, 40);
  const spaceBetweenLines = sideSize / numberOfLines;

  const startY = viewBoxHeight - viewBoxHeight / 10;
  const topY = startY - sideSize;

  const sideAngle = randomInt(20, 30);

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
  const topLines = topSide();

  function buildSide(reverse = false) {
    const lines = [];

    const baseAngle = 90 + sideAngle;
    const calculatedAngle = reverse ? baseAngle : 360 - baseAngle;

    for (let y = startY; y >= topY; y -= spaceBetweenLines) {
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
          stroke="${baseColor}" />
      `);
    }

    return lines;
  }

  function topSide() {
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
        altDistance += spaceBetweenLines * randomInt(3, 5)
      ) {
        const point = angledPositionFromPoint({
          angle: 360 - 90 - sideAngle,
          point: startPoint,
          distance: altDistance,
        });
        const modifier =
          distance > sideSize / 2 ? sideSize - distance : distance;
        const altModifier =
          altDistance > sideSize / 2 ? sideSize - altDistance : altDistance;

        const comboModifier =
          ((modifier + altModifier) * (modifier + altModifier)) / 5;

        const randomizedModifier = comboModifier * random(0.003, 0.006);
        point.y -= randomizedModifier;

        points.push(point);

        if (randomizedModifier > 80 && randomChance(0.2)) {
          const spiralX = point.x;
          const spiralY = point.y - randomInt(30, 120);
          const spiralR = randomInt(10, 30);
          const spiralStroke = randomHsl({ h: hue, l: [30, 70] });
          const newSpiralPoints = spiralPoints({
            x: spiralX,
            y: spiralY,
            r: spiralR,
          });
          lines.push(`
            <g 
              class="spiral"
            >
              <circle 
                cx="${spiralX}" 
                cy="${spiralY}" 
                r="${spiralR}" 
                fill="#fff"
                stroke="${spiralStroke}" />
              
              <path
                d="${spline(newSpiralPoints)}"
                fill="none"
                stroke="${spiralStroke}" />
            </g>`);
        }
      }

      lines.push(`
        <path 
          d="${spline([startPoint, ...points, endPoint])}"
          fill="#fff"
          stroke="${baseColor}" />
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
        y2="${startY}"
        stroke="${baseColor}" />
      `;
    const rightLine = `
      <line
        x1="${topRightPoint.x}" 
        x2="${topRightPoint.x}" 
        y1="${topRightPoint.y}" 
        y2="${topRightPoint.y + sideSize}"
        stroke="${baseColor}" />
    `;
    const leftLine = `
      <line
        x1="${topLeftPoint.x}" 
        x2="${topLeftPoint.x}" 
        y1="${topLeftPoint.y}" 
        y2="${topLeftPoint.y + sideSize}"
        stroke="${baseColor}" />
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
        stroke="${baseColor}" />
    `;
  }

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content:
      backLeftLine() +
      topLines.join("\n") +
      leftSideLines.join("\n") +
      rightSideLines.join("\n") +
      frontLines(),
  });
});
