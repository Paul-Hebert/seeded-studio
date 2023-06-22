import { buildSvg } from "../../helpers/build-svg.mjs";
import {
  randomInt,
  randomChanceOfNegative,
  randomDegree,
} from "randomness-helpers";
import { spline } from "../../helpers/spline.mjs";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.mjs";

export function draw() {
  const viewBoxWidth = 1100;
  const viewBoxHeight = 850;
  const frameSize = 100;
  const frameWidth = 10;
  const lines = [];
  const fruits = [];

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
      `<circle cx="${x}" cy="${y}" r="${fruitSize}" stroke="#000" fill="#fff" stroke-width="2" />`
    );
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
      </g>
    `,
    viewBoxWidth,
    viewBoxHeight,
  });
}

function drawLine(startX) {
  let y = 0;
  let x = startX;
}
