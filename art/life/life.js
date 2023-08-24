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
import { inkscapeLayer } from "../../helpers/inkscape-layer.js";

const viewBoxWidth = 1600;
const viewBoxHeight = 900;

const margin = 0;

const frameSize = 25;

const framedWidth = viewBoxWidth - (margin + frameSize);
const framedHeight = viewBoxHeight - (margin + frameSize);

const gridSize = 25;
const gridWidth = framedWidth / gridSize;
const gridHeight = framedHeight / gridSize;

export const handler = buildFunctionEndpoint(() => {
  const gridContents = [];
  for (let x = 0; x < gridWidth; x++) {
    let column = [];
    for (let y = 0; y < gridHeight; y++) {
      column.push(false);
    }
    gridContents.push(column);
  }

  const strokeColor = "#158466";
  const soloColor1 = "#8abfff";
  const fileColor = "#183889";
  const fileInnerColor = "#0e1c43";
  const skeletonColor = "#55476b";

  const fileBlocks = [
    { x: 4, y: 13, width: 9, height: 20, name: "button.tsx" },
    { x: 19, y: 15, width: 9, height: 15, name: "button.scss" },
    { x: 34, y: 12, width: 9, height: 12, name: "button.test.ts" },
    { x: 49, y: 14, width: 9, height: 18, name: "button.stories.mdx" },
  ];

  const terminalBlock = { x: 17, y: 5, width: 29, height: 4 };

  const blockRects = [];

  [...fileBlocks, terminalBlock].forEach((block) => {
    const rectPos = gridPosition(block);
    blockRects.push(`
      <rect 
        x="${rectPos.x}"
        y="${rectPos.y}"
        width="${(block.width - 1) * gridSize}"
        height="${(block.height - 1) * gridSize}"
        fill="${fileColor}"
        rx="12"
      />
    `);
    for (let left = block.x; left < block.x + block.width; left++) {
      for (let top = block.y; top < block.y + block.height; top++) {
        gridContents[left][top] = true;
      }
    }
  });

  const terminalTextPos = gridPosition({
    x: terminalBlock.x,
    y: terminalBlock.y + 1.95,
  });
  blockRects.push(`
        <text 
          fill="#fff" 
          stroke="none"
          x="${viewBoxWidth / 2}"
          y="${terminalTextPos.y}"
          dominant-baseline="center"
          text-anchor="middle"
          style="
            font-family: Source Code Pro;
            font-size: 2.5rem;
          "

        >
          $ npm run generate-component
        </text>
      `);

  const lines = [];

  fileBlocks.forEach((block) => {
    const textPos = gridPosition({
      x: block.x + 1,
      y: block.y + 1,
    });
    blockRects.push(`
        <text 
          fill="#fff" 
          stroke="none"
          x="${textPos.x}"
          y="${textPos.y}"
          dominant-baseline="middle"
          style="
            font-family: Source Sans Code;
            font-size: 1.35rem;
          "

        >
          ${block.name}
        </text>
      `);

    const innerRectPos = gridPosition({
      x: block.x,
      y: block.y + 2,
    });

    blockRects.push(`
      <rect 
        x="${innerRectPos.x}"
        y="${innerRectPos.y}"
        width="${(block.width - 1) * gridSize}"
        height="${(block.height - 3) * gridSize}"
        fill="${fileInnerColor}"
        rx="12"
      />
      <rect 
        x="${innerRectPos.x}"
        y="${innerRectPos.y}"
        width="${(block.width - 1) * gridSize}"
        height="${1 * gridSize}"
        fill="${fileInnerColor}"
      />
    `);

    for (let y = block.y + 3; y < block.y + block.height - 1; y++) {
      const startPoint = gridPosition({ x: block.x + 1, y: y - 0.25 });
      blockRects.push(`
        <rect 
          x="${startPoint.x}"
          y="${startPoint.y}"
          width="${gridSize * randomInt(3, block.width - 3)}"
          height="${gridSize / 2}"
          fill="${skeletonColor}"
          rx="6"
        />
      `);
    }

    // Connecting line
    const newLine = {
      isSpecialLine: true,
      isClosed: true,
      points: [],
    };

    let pos = {
      y: block.y + block.height - 5,
      x: block.x + Math.round(block.width / 2) - 1,
    };

    while (pos.y > terminalBlock.y + terminalBlock.height + 1) {
      gridContents[pos.x][pos.y] = true;
      newLine.points.push({ ...pos });
      pos.y--;
    }

    const xTarget = terminalBlock.x + Math.round(terminalBlock.width / 2);

    while (pos.x !== xTarget) {
      gridContents[pos.x][pos.y] = true;
      newLine.points.push({ ...pos });
      pos.x += pos.x > xTarget ? -1 : 1;
    }

    while (pos.y > terminalBlock.y + terminalBlock.height / 2 - 1) {
      gridContents[pos.x][pos.y] = true;
      newLine.points.push({ ...pos });
      pos.y--;
    }

    lines.push(newLine);
  });

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
        stroke="${line.isSpecialLine ? fileColor : strokeColor}"
        stroke-width="${line.isSpecialLine ? 8 : 4}"
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
      soloCircles.push(`
        <circle
          cx="${points[0].x}"
          cy="${points[0].y}"
          stroke="${soloColor1}"
          stroke-width="4"
          r="8"
          fill="${soloColor1}"
        />
      `);
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
          blockRects.join("")
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
