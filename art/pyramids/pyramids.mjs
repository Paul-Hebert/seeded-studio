import { randomHsl, randomInt } from "randomness-helpers";
import { buildSvg } from "../../helpers/build-svg.mjs";

export function draw() {
  let markup = "";

  const squareSize = randomInt(8, 15);
  const columnCount = 100 / squareSize;

  const color = randomHsl({ s: 30, l: 30 });
  const strokeWidth = 0.25;

  for (let xCount = 0; xCount < columnCount; xCount++) {
    for (let yCount = 0; yCount < columnCount; yCount++) {
      const x = xCount * squareSize;
      const y = yCount * squareSize;

      const cushion = (squareSize * 1) / 10;
      const innerPointX = randomInt(cushion, squareSize - cushion);
      const innerPointY = randomInt(cushion, squareSize - cushion);
      let section = "";

      const endSize = strokeWidth;
      const sizeDifference = squareSize - endSize;

      for (let i = 0; i < columnCount; i++) {
        const shrinkage = (i / columnCount) * sizeDifference;
        const currentSize = squareSize - shrinkage;

        section += `
            <rect 
              x="${x + (innerPointX / columnCount) * i}"
              y="${y + (innerPointY / columnCount) * i}"
              width="${currentSize}"
              height="${currentSize}"
              stroke="${color}"
              stroke-width="${strokeWidth}"
              fill="none"
            />
          `;
      }

      markup += `<g>${section}</g>`;
    }
  }

  return buildSvg({ content: markup });
}
