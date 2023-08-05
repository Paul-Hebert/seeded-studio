import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { randomInt, random } from "randomness-helpers";

export const handler = buildFunctionEndpoint(() => {
  const height = randomInt(300, 850);
  const strokeWidth = 10;
  opacity = 0.45;

  return buildSvg({
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    content:
      trunk({ x: 500, y: 900, height, strokeWidth, opacity }) +
      branches({ x: 500, y: 900, height, strokeWidth, opacity }),
  });
});

function trunk({ x, y, height, strokeWidth, opacity }) {
  const lines = [];
  for (let i = 0; i < height / 100; i++) {
    lines.push(`
      <line
        x1="${x - (strokeWidth * i) / 2}"
        x2="${x}"
        y1="${y}"
        y2="${y - height}"
        stroke="#000"
        opacity="${opacity}"
        stroke-width="${strokeWidth}"
      />
      <line
        x1="${x + (strokeWidth * i) / 2}"
        x2="${x}"
        y1="${y}"
        y2="${y - height}"
        opacity="${opacity}"
        stroke="#000"
        stroke-width="${strokeWidth}"
      />
    `);
  }
  return lines.join("");
}

function branches({ x, y, height, strokeWidth, opacity }) {
  const lines = [];
  for (
    let distanceTravelled = 0;
    distanceTravelled < height / random(2, 2.25);
    distanceTravelled += height / randomInt(75, 100)
  ) {
    const branchSize = 10 + distanceTravelled * random(0.4, 0.8);
    const yStart = y - height + distanceTravelled;
    const randomMod = randomInt(10, 20);
    for (
      let xMod = branchSize * -1;
      xMod < branchSize;
      xMod += randomInt(10, 30) - branchSize / 60
    ) {
      const yTop = yStart + randomInt(-1 * randomMod, randomMod);
      let yBottom = yTop + branchSize;
      yBottom += (branchSize - Math.abs(xMod)) / (branchSize / 45);

      lines.push(`
        <path
          d="
            M${x} ${yStart}
            Q${x + randomInt(-1 * randomMod, randomMod)} 
              ${yBottom + randomInt(-1 * randomMod, randomMod)}
              
              ${x + xMod + randomInt(-1 * randomMod, randomMod)}
              ${yBottom + randomInt(-1 * randomMod, randomMod)}
          "
          fill="none"
          opacity="${opacity}"
          stroke="#000"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />
      `);
    }
  }
  return lines.join("");
}
