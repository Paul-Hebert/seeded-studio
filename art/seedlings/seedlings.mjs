import { buildSvg } from "../../helpers/build-svg.mjs";
import {
  randomInt,
  randomChanceOfNegative,
  randomDegree,
  setSeed,
} from "randomness-helpers";
import { spline } from "../../helpers/spline.mjs";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.mjs";

export function draw(seed) {
  setSeed(seed);

  const viewBoxWidth = 1100;
  const viewBoxHeight = 850;
  const frameSize = 100;
  const frameWidth = 10;
  const lines = [];
  const fruits = [];
  const fruitDetails = [];

  const lineCount = randomInt(5, 10);

  for (let i = 0; i < lineCount; i++) {
    let y = viewBoxHeight - frameSize;
    const xRange = viewBoxWidth - frameSize * 4;
    let x = frameSize * 2 + (i * xRange) / lineCount;

    const points = [{ x, y }];

    for (let z = 0; z < randomInt(5, 15); z++) {
      y -= randomInt(30, 70);
      x += randomChanceOfNegative(randomInt(0, 20));
      points.push({ x, y });
    }

    lines.push(
      `<path fill="none" stroke="#000" d="${spline(
        points
      )}" stroke-width="10"/>`
    );

    const fruitSize = randomInt(20, 50);

    for (let a = 0; a < randomInt(20, 40); a++) {
      const angle = randomDegree();
      const distance = randomInt(0, fruitSize - 4);

      const circlePoint = angledPositionFromPoint({
        angle,
        distance,
        point: { x, y },
      });
    }

    fruits.push(
      `<circle cx="${x}" cy="${y}" r="${fruitSize}" fill="#fff" stroke-width="2" />`
    );

    let fruitDetail = `<circle cx="${x}" cy="${y}" r="${fruitSize}" fill="#fff" />`;

    const innerCirclePos = {
      x: x + randomInt((fruitSize / 4) * -1, fruitSize / 4),
      y: y + randomInt(fruitSize / 4, fruitSize / 2),
    };

    const innerCircleSize = randomInt(fruitSize / 5, fruitSize / 3);

    for (let angle = 0; angle < 360; angle += Math.min(15, fruitSize / 3)) {
      const innerCirclePoint = angledPositionFromPoint({
        angle,
        point: innerCirclePos,
        distance: innerCircleSize,
      });
      const outerCirclePoint = angledPositionFromPoint({
        angle,
        point: { x, y },
        distance: fruitSize,
      });
      fruitDetail += `
        <line
          x1="${innerCirclePoint.x}" 
          y1="${innerCirclePoint.y}"
          x2="${outerCirclePoint.x}" 
          y2="${outerCirclePoint.y}"
          fill="none"
          stroke="#000"

        />
      `;
    }

    fruitDetail += `<circle cx="${innerCirclePos.x}" cy="${innerCirclePos.y}" r="${innerCircleSize}" stroke="#000" fill="none" stroke-width="2" />`;
    fruitDetail += `<circle cx="${x}" cy="${y}" r="${fruitSize}" stroke="#000" fill="none" stroke-width="2" />`;

    fruitDetails.push(fruitDetail);
  }

  return buildSvg({
    content: `
      <g class="0 frame-light">
        <rect
          x="${frameSize - frameWidth}" 
          y="${frameSize - frameWidth}" 
          width="${viewBoxWidth - frameSize * 2 + frameWidth * 2}"
          height="${viewBoxHeight - frameSize * 2 + frameWidth * 2}"
          fill="none"
          stroke="#000"
          stroke-width="2"
        />
      </g>
      <g class="1 dark">
        <rect
          x="${frameSize}" 
          y="${frameSize}" 
          width="${viewBoxWidth - frameSize * 2}"
          height="${viewBoxHeight - frameSize * 2}"
          fill="none"
          stroke="#000"
          stroke-width="10"
        />
        ${lines.join("")}
      </g>
      <g class="2 circles">
        ${fruits.join("")}
        ${fruitDetails.join("")}
      </g>
    `,
    viewBoxWidth,
    viewBoxHeight,
  });
}
