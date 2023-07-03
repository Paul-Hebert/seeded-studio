import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { randomInt, randomHsl } from "randomness-helpers";
import { logo } from "../../bits/branding/logo.js";
import { printId } from "../../bits/branding/print-id.js";

export const handler = buildFunctionEndpoint((seed) => {
  const viewBoxWidth = 850;
  const viewBoxHeight = 1100;

  const frameSize = 100;

  const color = randomHsl({ l: 50 });

  const circles = [];
  const lines = [];

  const gapSize = (viewBoxWidth - frameSize) / randomInt(30, 60);

  for (let i = 0; i < randomInt(30, 50); i++) {
    circles.push(
      circleGroup({
        x: randomInt(frameSize, viewBoxWidth - frameSize),
        y: randomInt(frameSize, viewBoxHeight - frameSize),
        r: randomInt(50, 200),
        color,
        gapSize,
      })
    );
  }

  for (
    let x = frameSize + gapSize;
    x <= viewBoxWidth - frameSize;
    x += gapSize
  ) {
    lines.push(
      `<line 
        x1="${x}" 
        x2="${x}" 
        y1="${frameSize}" 
        y2="${viewBoxHeight - frameSize}"
        stroke="${color}"
        stroke-width="5"
      />`
    );
  }

  const frame = `
    <rect fill="#fff" x="-500" y="-500" width="620" height="${
      viewBoxHeight + 1000
    }"/>
    <rect fill="#fff" x="${
      viewBoxWidth - frameSize - 20
    }" y="-500" width="620" height="${viewBoxHeight + 1000}"/>
    <rect fill="#fff" x="-500" y="-500" width="${
      viewBoxWidth + 1000
    }" height="620"/>
    <rect fill="#fff" x="-500" y="${viewBoxHeight - frameSize - 20}" width="${
    viewBoxWidth + 1000
  }" height="600"/>
    <rect
      fill="none"
      stroke="${color}" 
      stroke-width="5"
      x="${frameSize}" 
      y="${frameSize}"
      width="${viewBoxWidth - frameSize * 2}"
      height="${viewBoxHeight - frameSize * 2}"
    />
  `;

  const branding =
    logo({ x: frameSize, y: viewBoxHeight - frameSize + 28, color }) +
    printId({
      x: viewBoxWidth - frameSize,
      y: viewBoxHeight - frameSize + 28,
      color,
      name: "Stone Circles",
      seed,
    });

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content: lines.join("\n") + circles.join("\n") + frame + branding,
  });
});

function circle({ x, y, r, fill = "none", stroke = "#999" }) {
  // TODO: Rotate
  return `<circle cx='${x}' cy='${y}' r='${r}' fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
}

function circleGroup({ x, y, r, color, gapSize }) {
  const circles = [circle({ x, y, r, fill: "#fff", stroke: "none" })];

  r -= gapSize / 2;

  while (r > 0) {
    circles.push(circle({ x, y, r, stroke: color }));
    r -= gapSize;
  }

  return circles.join("\n");
}
