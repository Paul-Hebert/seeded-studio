import { buildSvg } from "../../helpers/build-svg.js";
import {
  randomInt,
  randomChanceOfNegative,
  randomHsl,
} from "randomness-helpers";
import { spline } from "@georgedoescode/spline";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { angleBetweenPoints } from "../../helpers/angle-between-points.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";

export const handler = buildFunctionEndpoint(() => {
  const viewBoxWidth = 1100;
  const viewBoxHeight = 850;
  const frameSize = 100;
  const frameWidth = 10;
  const lines = [];
  const fruits = [];
  const fruitDetails = [];

  const lineCount = randomInt(5, 10);

  const detailColor = "green";
  const stemColor = randomHsl({ h: 240, s: [40, 79], l: [30, 70] });
  const flowerButtColor = randomHsl({ h: 300, s: 50, l: [30, 70] });

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
      `<path 
        fill="none"
        stroke="${stemColor}"
        d="${spline(points)}" 
        stroke-width="8"
        stroke-linecap="round"
      />`
    );

    // points.forEach((point) =>
    //   lines.push(`<circle cx="${point.x}" cy="${point.y}" r="6" />`)
    // );

    const fruitSize = randomInt(20, 50);

    const outerCircleAngle = angleBetweenPoints(points.at(-2), points.at(-1));

    const outerCirclePos = angledPositionFromPoint({
      angle: outerCircleAngle,
      point: { x, y },
      distance: fruitSize,
    });

    // const stamenPos = angledPositionFromPoint({
    //   angle: outerCircleAngle,
    //   point: { x, y },
    //   distance: fruitSize * 2.5,
    // });

    fruits.push(
      `<circle cx="${outerCirclePos.x}" cy="${outerCirclePos.y}" r="${fruitSize}" fill="#fff" stroke-width="2" />`
    );

    let fruitDetail = `<circle cx="${outerCirclePos.x}" cy="${outerCirclePos.y}" r="${fruitSize}" fill="#fff" />`;

    // fruitDetail += `<line x1="${x}" y1="${y}" x2="${stamenPos.x}" y2="${stamenPos.y}" stroke="${detailColor}" stroke-width="5" />`;

    // fruitDetail += `<circle cx="${stamenPos.x}" cy="${stamenPos.y}" r="${
    //   fruitSize / 5
    // }" fill="${detailColor}" />`;

    const innerCircleSize = randomInt(fruitSize / 5, fruitSize / 3);

    for (let angle = 0; angle < 360; angle += Math.max(12, fruitSize / 5)) {
      const innerCirclePoint = angledPositionFromPoint({
        angle,
        point: { x, y },
        distance: innerCircleSize,
      });
      const outerCirclePoint = angledPositionFromPoint({
        angle,
        point: outerCirclePos,
        distance: fruitSize,
      });
      fruitDetail += `
        <line
          x1="${innerCirclePoint.x}" 
          y1="${innerCirclePoint.y}"
          x2="${outerCirclePoint.x}" 
          y2="${outerCirclePoint.y}"
          fill="none"
          stroke="${detailColor}"

        />
      `;
    }

    fruitDetail += `<circle cx="${x}" cy="${y}" r="${innerCircleSize}" fill="none" stroke="${flowerButtColor}" stroke-width="2" />`;
    // fruitDetail += `<circle cx="${outerCirclePos.x}" cy="${outerCirclePos.y}" r="${fruitSize}" stroke="#000" fill="none" stroke-width="2" />`;

    fruitDetails.push(fruitDetail);
  }

  return buildSvg({
    content: `
      <g inkscape:groupmode="layer" inkscape:label="0 frame-light">
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
      <g inkscape:groupmode="layer" inkscape:label="1 dark">
        <rect
          x="${frameSize}" 
          y="${frameSize}" 
          width="${viewBoxWidth - frameSize * 2}"
          height="${viewBoxHeight - frameSize * 2}"
          fill="none"
          stroke="#000"
          stroke-width="10"
        />
      </g>
      <g inkscape:groupmode="layer" inkscape:label="2 circles">
        ${fruits.join("")}
        ${fruitDetails.join("")}
      </g>
      <g inkscape:groupmode="layer" inkscape:label="1 lines">
        ${lines.join("")}
      </g>
    `,
    viewBoxWidth,
    viewBoxHeight,
  });
});
