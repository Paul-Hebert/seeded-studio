import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import {
  randomHsl,
  randomInt,
  randomItemInArray,
  randomChance,
  randomHue,
} from "randomness-helpers";
import { spline } from "@georgedoescode/spline";
import { spiralPoints } from "../../bits/shapes/spiral-points.js";
import { inkscapeLayer } from "../../helpers/inkscape-layer.js";
import FastNoise from "fastnoise-lite";

const viewBoxWidth = 1100;
const viewBoxHeight = 850;
// const viewBoxWidth = 1000;
// const viewBoxHeight = 1000;

const margin = 25;

const frameSize = 25;

const framedWidth = viewBoxWidth - (margin + frameSize);
const framedHeight = viewBoxHeight - (margin + frameSize);

const gridSize = 25;
const gridWidth = framedWidth / gridSize;
const gridHeight = framedHeight / gridSize;

export const handler = buildFunctionEndpoint((seed) => {
  const noise = new FastNoise();
  noise.SetNoiseType(
    FastNoise.NoiseType[
      randomItemInArray([
        "OpenSimplex2",
        "OpenSimplex2S",
        "Cellular",
        "Perlin",
        // "ValueCubic",
        // "Value",
      ])
    ]
  );
  noise.SetSeed(seed);
  noise.SetFrequency(0.01);

  const gridContents = [];
  for (let x = 0; x < gridWidth - 1; x++) {
    let column = [];
    for (let y = 0; y < gridHeight - 1; y++) {
      column.push(false);
    }
    gridContents.push(column);
  }

  const h = randomHue();
  const strokeColor = randomHsl({ h, l: 20 });
  const soloColor1 = randomHsl({ h: h - 120, l: 50 });
  const soloColor2 = randomHsl({ h: h + 120, l: 50 });

  const frame = `
    <rect
      width="${framedWidth}" 
      height="${framedHeight}"
      x="${margin}"
      y="${margin}"
      stroke="${strokeColor}"
      stroke-width="4"
      fill="none"
    />
  `;

  const wonkyCircles = [];

  // for (let i = 0; i < randomInt(1, 5); i++) {
  //   const topSide = randomInt(2, gridHeight - 3);
  //   const leftSide = randomInt(2, gridHeight - 3);

  //   const size = 2; //randomInt(2, 4);

  //   for (let left = 0; left < size; left++) {
  //     for (let top = 0; top < size; top++) {
  //       gridContents[leftSide + left][topSide + top] = "wonky";
  //     }
  //   }

  //   const { x, y } = gridPosition({
  //     x: leftSide + size / 4,
  //     y: topSide + size / 4,
  //   });

  //   wonkyCircles.push(`
  //     <path
  //       d="${spline(
  //         wonkyCirclePoints({ cx: x, cy: y, r: ((gridSize - 5) * size) / 2 }),
  //         1,
  //         true
  //       )}"
  //       stroke="${soloColor2}"
  //       fill="none"
  //       stroke-width="4"
  //     />
  //     <circle
  //       cx="${x}"
  //       cy="${y}"
  //       r="2"
  //       stroke="${soloColor2}"
  //       fill="none"
  //       stroke-width="4"
  //     />
  //   `);
  // }

  const lines = [];

  for (let i = 0; i < randomInt(10, 100); i++) {
    const x = randomInt(0, gridWidth - 1);
    const y = randomInt(0, gridHeight - 1);

    if (isPositionOpen({ x, y }, gridContents)) {
      gridContents[x][y] = true;

      lines.push({
        isClosed: false,
        points: [
          {
            x,
            y,
          },
        ],
      });
    }
  }

  let emptyPoints = getEmptyPoints(gridContents);

  while (emptyPoints.length) {
    const openLines = lines.filter((line) => !line.isClosed);

    if (openLines.length < 10) {
      const { x, y } = randomItemInArray(emptyPoints);
      gridContents[x][y] = true;

      lines.push({
        isClosed: false,
        points: [
          {
            x,
            y,
          },
        ],
      });
    }
    openLines.forEach((line) => {
      const { x, y } = line.points.at(-1);

      const localNoise = noise.GetNoise(x * 30, y * 30);

      if (localNoise < -0.33) {
        const nextPositions = [];

        const above = {
          x,
          y: y - 1,
        };
        const below = {
          x,
          y: y + 1,
        };
        const left = {
          x: x - 1,
          y,
        };
        const right = {
          x: x + 1,
          y,
        };

        if (isPositionOpen(above, gridContents)) {
          nextPositions.push(above);
        }
        if (isPositionOpen(below, gridContents)) {
          nextPositions.push(below);
        }
        if (isPositionOpen(left, gridContents)) {
          nextPositions.push(left);
        }
        if (isPositionOpen(right, gridContents)) {
          nextPositions.push(right);
        }

        if (nextPositions.length === 0) {
          line.isClosed = true;
        } else {
          // if (randomChance(0.25)) {
          //   lines.push({
          //     isClosed: false,
          //     points: [...line.points],
          //   });
          // }

          const nextPoint = randomItemInArray(nextPositions);
          gridContents[nextPoint.x][nextPoint.y] = true;
          line.points.push(nextPoint);
        }
      } else if (localNoise < 0.33) {
        const nextPositions = [
          // top left
          {
            x: x - 1,
            y: y - 1,
          },
          // top
          {
            x,
            y: y - 1,
          },
          // top right
          {
            x: x + 1,
            y: y - 1,
          },
          // left
          {
            x: x - 1,
            y,
          },
          // right
          {
            x: x + 1,
            y,
          },
          // bottom left
          {
            x: x + 1,
            y: y - 1,
          },
          // bottom
          {
            x,
            y: y + 1,
          },
          // bottom right
          {
            x: x + 1,
            y: y + 1,
          },
        ].filter((pos) => isPositionOpen(pos, gridContents));

        if (nextPositions.length === 0) {
          line.isClosed = true;
        } else {
          const nextPoint = randomItemInArray(nextPositions);
          gridContents[nextPoint.x][nextPoint.y] = true;
          line.points.push(nextPoint);
        }
      } else {
        const nextPositions = [
          // top left
          {
            x: x - 1,
            y: y - 1,
          },
          // top
          {
            x,
            y: y - 1,
          },
          // top right
          {
            x: x + 1,
            y: y - 1,
          },
          // left
          {
            x: x - 1,
            y,
          },
          // right
          {
            x: x + 1,
            y,
          },
          // bottom left
          {
            x: x + 1,
            y: y - 1,
          },
          // bottom
          {
            x,
            y: y + 1,
          },
          // bottom right
          {
            x: x + 1,
            y: y + 1,
          },
        ].filter((pos) => isPositionOpen(pos, gridContents));

        if (nextPositions.length === 0 || randomChance(0.25)) {
          line.isClosed = true;
        } else {
          nextPositions.forEach((position, i) => {
            if (randomChance(0.5)) {
              gridContents[position.x][position.y] = true;
              // if (randomChance(0.8)) {
              if (i === nextPositions.length - 1 || nextPositions.length < 4) {
                line.points.push(position);
              } else {
                lines.push({
                  isBranch: true,
                  isClosed: false,
                  points: [line.points.at(-1), position],
                });
              }
              // }
            }
          });
        }
      }
    });

    emptyPoints = getEmptyPoints(gridContents);
  }

  const paths = [];
  const startCircles = [];
  const endCircles = [];
  const soloCircles = [];

  lines.forEach((line) => {
    const points = line.points.map(gridPosition);
    paths.push(`
      <path
        d="${spline(points)}"
        stroke="${strokeColor}"
        stroke-width="4"
        fill="none"
      />
    `);

    if (points.length > 1) {
      startCircles.push(`
        <circle
          cx="${points[0].x}"
          cy="${points[0].y}"
          stroke="${strokeColor}"
          stroke-width="4"
          r="5"
          fill="#fff"
        />
      `);
      endCircles.push(`
        <circle
          cx="${points.at(-1).x}"
          cy="${points.at(-1).y}"
          stroke="${strokeColor}"
          stroke-width="4"
          r="8"
          fill="#fff"
        />
      `);
    } else {
      const newSpiralPoints = spiralPoints({
        x: points[0].x,
        y: points[0].y,
        r: 8,
        // deltaMod: 100,
        // angleChange: 90,
        deltaMod: 100,
        angleChange: 50,
      });
      soloCircles.push(`
        <path
          d="${spline(newSpiralPoints)}"
          fill="none"
          stroke-width="4"
          stroke="${soloColor1}"
        />
        <circle
          cx="${points[0].x}"
          cy="${points[0].y}"
          stroke="${soloColor1}"
          stroke-width="4"
          r="6"
          fill="none"
        />
      `);

      // endCircles.push();
      // endCircles.push(`
      //   <circle
      //     cx="${points.at(-1).x}"
      //     cy="${points.at(-1).y}"
      //     stroke="${strokeColor}"
      //     stroke-width="4"
      //     r="2"
      //     fill="#fff"
      //   />
      // `);
    }
  });

  return buildSvg({
    viewBoxHeight,
    viewBoxWidth,
    content:
      inkscapeLayer(
        "0 - main pattern",
        // frame +
        paths.join("") +
          startCircles.join("") +
          endCircles.join("") +
          wonkyCircles.join("")
      ) + inkscapeLayer("1 - solo circles", soloCircles.join("")),
  });
});

function isPositionOpen({ x, y }, gridContents) {
  if (x < 0 || y < 0 || x > gridWidth - 1 || y > gridHeight - 1) {
    return false;
  }

  if (
    typeof gridContents[x] === "undefined" ||
    typeof gridContents[x][y] === "undefined"
  ) {
    return false;
  }

  return !gridContents[x][y];
}

function gridPosition({ x, y }) {
  return {
    x: margin + frameSize + x * gridSize,
    y: margin + frameSize + y * gridSize,
  };
}

function getEmptyPoints(gridContents) {
  const emptyPoints = [];
  for (let x = 0; x < gridWidth - 1; x++) {
    for (let y = 0; y < gridHeight - 1; y++) {
      if (!gridContents[x][y]) {
        emptyPoints.push({ x, y });
      }
    }
  }

  return emptyPoints;
}
