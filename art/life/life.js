import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import {
  randomHsl,
  randomInt,
  randomItemInArray,
  randomChance,
} from "randomness-helpers";
import { spline } from "@georgedoescode/spline";

const viewBoxWidth = 1100;
const viewBoxHeight = 850;

const margin = 75;

const frameSize = 25;

const framedWidth = viewBoxWidth - (margin + frameSize) * 2;
const framedHeight = viewBoxHeight - (margin + frameSize) * 2;

const gridSize = 25;
const gridWidth = framedWidth / gridSize - 1;
const gridHeight = framedHeight / gridSize - 1;

export const handler = buildFunctionEndpoint(() => {
  const gridContents = [];
  for (let x = 0; x < gridWidth - 1; x++) {
    let column = [];
    for (let y = 0; y < gridHeight - 1; y++) {
      column.push(false);
    }
    gridContents.push(column);
  }

  const strokeColor = randomHsl({ l: 20 });

  const frame = `
    <rect
      width="${framedWidth}" 
      height="${framedHeight}"
      x="${margin}"
      y="${margin}"
      stroke="${strokeColor}"
      stroke-width="5"
      fill="none"
    />
  `;

  let content = frame;

  const lines = [];

  for (let i = 0; i < randomInt(50, 100); i++) {
    const x = randomInt(0, gridWidth - 1);
    const y = randomInt(0, gridHeight - 1);

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

  for (let i = 0; i < 100; i++) {
    lines
      .filter((line) => !line.isClosed)
      .forEach((line) => {
        const { x, y } = line.points.at(-1);

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
          x: x - 1,
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
          if (randomChance(0.25)) {
            lines.push({
              isClosed: false,
              points: [...line.points],
            });
          }

          const nextPoint = randomItemInArray(nextPositions);
          gridContents[nextPoint.x][nextPoint.y] = true;
          line.points.push(nextPoint);
        }
      });
  }

  const paths = [];
  const circles = [];

  lines.forEach((line) => {
    const points = line.points.map(gridPosition);
    paths.push(`
      <path
        d="${spline(points)}"
        stroke="${strokeColor}"
        stroke-width="5"
        fill="none"
      />
    `);
    circles.push(`
      <circle
        cx="${points[0].x}"
        cy="${points[0].y}"
        stroke="${strokeColor}"
        stroke-width="5"
        r="5"
        fill="#fff"
      />
      <circle
        cx="${points.at(-1).x}"
        cy="${points.at(-1).y}"
        stroke="${strokeColor}"
        stroke-width="5"
        r="5"
        fill="#fff"
      />
    `);
  });

  return buildSvg({
    viewBoxHeight,
    viewBoxWidth,
    content: frame + paths.join("") + circles.join(""),
  });
});

function isPositionOpen({ x, y }, gridContents) {
  if (x < 0 || y < 0 || x > gridWidth - 1 || y > gridHeight - 1) {
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
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!gridContents[x][y]) {
        emptyPoints.push({ x, y });
      }
    }
  }

  return emptyPoints;
}
