import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import {
  random,
  randomInt,
  randomItemInArray,
  randomChance,
} from "randomness-helpers";
import FastNoise from "fastnoise-lite";
import { spline } from "@georgedoescode/spline";

export const handler = buildFunctionEndpoint((seed) => {
  const viewBoxHeight = 850;
  const viewBoxWidth = 1100;

  const topGap = viewBoxHeight / 3;

  const noise = new FastNoise();
  const noiseType = randomItemInArray([
    "OpenSimplex2",
    "OpenSimplex2S",
    // "Cellular",
    "Perlin",
    // "ValueCubic",
    // "Value",
  ]);
  noise.SetNoiseType(FastNoise.NoiseType[noiseType]);
  noise.SetSeed(seed);
  noise.SetFrequency(random(0.01, 0.2));

  let content = `<rect fill="#000" x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}"/>`;

  const gap = randomInt(2, 4) * 5;
  const slant = randomInt(-30, 30);

  for (let y = topGap; y < viewBoxHeight - gap; y += gap) {
    for (let x = gap; x < viewBoxWidth - gap; x += gap) {
      const noiseVal = noise.GetNoise(x, y) * 300;
      if (noiseVal > 0) {
        const width = gap;
        const points = [
          {
            x: x - width / 2,
            y,
          },
          {
            x: x + slant + randomInt(-10, 10),
            y: y - noiseVal,
          },
          {
            x: x + width / 2,
            y,
          },
        ];
        content += `<path
          d="${spline(points)}"
          fill="#000"
          stroke="#fff"
          stroke-linecap="round"
          stroke-width="2"
        />`;
      }

      // content += `<circle
      //   cx="${x}"
      //   cy="${y}"
      //   r="${20 + noise.GetNoise(x, y) * 20}"
      //   fill="#fff"
      // />`;
    }
  }

  return buildSvg({
    viewBoxHeight,
    viewBoxWidth,
    content,
  });
});
