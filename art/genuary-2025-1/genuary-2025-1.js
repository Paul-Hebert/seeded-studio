import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { randomHsl, randomHsla } from "randomness-helpers";
import { randomInt } from "crypto";

export const handler = buildFunctionEndpoint(() => {
  const squigglyLines = [];

  const height = 900;
  const width = 1600;

  const lineSpacing = [100, 200];
  const xSpacing = 25;
  const scaledWidth = width / xSpacing;

  let y = randomInt(...lineSpacing);

  while (y < height * 1.5) {
    let localY = y;

    const newLine = [];

    for (let x = 0; x < scaledWidth; x++) {
      console.log(x);
      localY += randomInt(-20, 20);

      newLine.push(localY);
    }

    squigglyLines.push(newLine);
    y += randomInt(...lineSpacing);
  }

  function drawVerticalLines(lines) {
    const svgLines = [];
    const lineWidth = 25;

    for (let lineCount = 0; lineCount < lines.length; lineCount++) {
      for (let x = 0; x < scaledWidth; x++) {
        const y = lines[lineCount][x];
        const y2 = lines[lineCount + 1]
          ? lines[lineCount + 1][x]
          : height + 100;

        svgLines.push(
          `<rect 
            x="${xSpacing / 2 + x * xSpacing - lineWidth / 2}"
            width="${lineWidth}"
            y="${y}" 
            height="${y2 - y}"
            stroke="white"
            stroke-width="${lineWidth / 2}"
            rx="${lineWidth / 2}"
            fill="url(#gradient)"
          >
          </rect>`
        );
      }
    }
    return svgLines.join("");
  }

  const hue = randomInt(0, 360);
  const topColor = `hsl(${hue}deg, 100%, 30%)`;
  const bottomColor = `hsla(${hue}deg, 50%, 100%, 0%)`;

  return buildSvg({
    content: `
      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${topColor}" />
        <stop offset="100%" stop-color="${bottomColor}" />
      </linearGradient>

      ${drawVerticalLines(squigglyLines)}
    `,
    viewBoxHeight: height,
    viewBoxWidth: width,
  });
});
