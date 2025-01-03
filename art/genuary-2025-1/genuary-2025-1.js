import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import {
  randomHsl,
  randomHsla,
  random,
  randomInt,
  randomItemInArray,
} from "randomness-helpers";
import FastNoise from "fastnoise-lite";

export const handler = buildFunctionEndpoint((seed) => {
  const noise = new FastNoise();
  const noiseType = randomItemInArray([
    // "OpenSimplex2",
    // "OpenSimplex2S",
    // "Cellular",
    "Perlin",
    // "ValueCubic",
    // "Value",
  ]);
  noise.SetNoiseType(FastNoise.NoiseType[noiseType]);
  noise.SetSeed(seed);
  noise.SetFrequency(random(0.05, 0.1));

  const squigglyLines = [];

  const height = 900;
  const width = 1600;

  const lineSpacing = [100, 200];
  const xSpacing = randomItemInArray([10, 20, 30, 40, 50]);
  const scaledWidth = width / xSpacing;

  let y = randomInt(...lineSpacing);

  while (y < height * 1.5) {
    const newLine = [];

    for (let x = 0; x < scaledWidth; x++) {
      const noiseVal = noise.GetNoise(x, y);
      newLine.push(y + noiseVal * 100);
    }

    squigglyLines.push(newLine);
    y += randomInt(...lineSpacing);
  }

  const hue = random(0, 360);

  function drawVerticalLines(lines) {
    const svgLines = [];
    const lineWidth = xSpacing;

    for (let lineCount = 0; lineCount < lines.length; lineCount++) {
      const saturation = 100 - lineCount * 10;
      const lightness = 100 - 100 * ((lineCount + 1) / lines.length);

      const topColor = `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
      const bottomColor = `hsla(${hue}deg, ${saturation / 2}%, 100%, 0%)`;

      svgLines.push(`
        <linearGradient id="gradient-${lineCount}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${topColor}" />
          <stop offset="100%" stop-color="${bottomColor}" />
        </linearGradient>
      `);

      for (let x = 0; x < scaledWidth; x++) {
        const y = lines[lineCount][x];
        const y2 = lines[lineCount + 1]
          ? lines[lineCount + 1][x] - 10
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
            fill="url(#gradient-${lineCount})"
          >
          </rect>`
        );
      }
    }
    return svgLines.join("");
  }

  return buildSvg({
    content: drawVerticalLines(squigglyLines),
    viewBoxHeight: height,
    viewBoxWidth: width,
  });
});
