import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt, randomDegree } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";
import { pointsOnPath } from "points-on-path";

export const handler = buildFunctionEndpoint(() => {
  const centerPos = { x: 500, y: 500 };
  const outerCircleRadius = randomInt(300, 350);

  const ringAngleDiff = randomDegree(0, 360);

  let pos = centerPos;
  let radius = outerCircleRadius;

  const pointCount = randomInt(10, 20);
  const pointModifiers = [];
  const modifierRange = 0.015;

  for (let i = 0; i < pointCount; i++) {
    pointModifiers.push(random(1 - modifierRange, 1 + modifierRange));
  }

  const outerRing = addRing({ pointCount, pointModifiers, pos, radius });

  const rings = [outerRing.ring];

  const innerSize = randomInt(50, 100);

  while (radius > 0) {
    const isInner = radius < innerSize;

    const posDiff = isInner ? 200 : 75;

    pos = angledPositionFromPoint({
      angle: ringAngleDiff,
      point: pos,
      distance: (radius / posDiff) * random(0.7, 1.3),
    });

    const sizeDiff = isInner ? 2 : 10;

    radius -= sizeDiff * random(0.4, 1.4);

    const newRing = addRing({ pointCount, pointModifiers, pos, radius });
    rings.push(newRing.ring);
  }

  radius = outerCircleRadius + randomInt(30, 50);
  pos = centerPos;

  const barkRingBase = addRing({ pointCount, pointModifiers, pos, radius });

  let modifiedBarkRingPoints = pointsOnPath(
    spline(barkRingBase.points, 1, true),
    0.25,
    0.25
  )[0];

  const startingBarkModifier = 3.25;

  modifiedBarkRingPoints = modifiedBarkRingPoints.map((point) => ({
    x: point[0] + randomInt(-1 * startingBarkModifier, startingBarkModifier),
    y: point[1] + randomInt(-1 * startingBarkModifier, startingBarkModifier),
  }));

  for (let i = 0; i < 10; i++) {
    modifiedBarkRingPoints = modifiedBarkRingPoints.map((point) => ({
      x: point.x + randomInt(-1, 1),
      y: point.y + randomInt(-1, 1),
    }));

    rings.push(`
      <path
        d="${spline(modifiedBarkRingPoints, 1, true)}"
        fill="none"
        stroke="#000"
        class="bark-ring"
      />`);
  }

  let modifiedOuterRingPoints = pointsOnPath(
    spline(outerRing.points, 1, true),
    0.25,
    0.25
  )[0];

  modifiedOuterRingPoints = modifiedOuterRingPoints.map((point) => ({
    x: point[0],
    y: point[1],
  }));

  for (let i = 0; i < 10; i++) {
    modifiedOuterRingPoints = modifiedOuterRingPoints.map((point) => ({
      x: point.x + randomInt(-0.5, 0.5),
      y: point.y + randomInt(-0.5, 0.5),
    }));

    rings.push(`
      <path
        d="${spline(modifiedOuterRingPoints, 1, true)}"
        fill="none"
        stroke="#000"
        class="bark-ring"
      />`);
  }

  const barkLines = [];

  for (let i = 0; i < modifiedBarkRingPoints.length; i++) {
    for (let z = 0; z <= 20; z++) {
      const percentComplete = i / modifiedBarkRingPoints.length;
      const innerIndex =
        Math.round(modifiedOuterRingPoints.length * percentComplete) +
        randomInt(-5, 5);

      const outerIndex = i + randomInt(-5, 5);

      barkLines.push(`
        <line
          x1="${
            modifiedBarkRingPoints[
              constrainIndex(outerIndex, modifiedBarkRingPoints)
            ].x
          }"
          y1="${
            modifiedBarkRingPoints[
              constrainIndex(outerIndex, modifiedBarkRingPoints)
            ].y
          }"
          x2="${
            modifiedOuterRingPoints[
              constrainIndex(innerIndex, modifiedOuterRingPoints)
            ].x
          }"
          y2="${
            modifiedOuterRingPoints[
              constrainIndex(innerIndex, modifiedOuterRingPoints)
            ].y
          }"
          stroke="#000"
          fill="none"
        />
      `);
    }
  }

  return buildSvg({
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    displayWidth: 500,
    displayHeight: 500,
    content: rings.join("\n") + barkLines.join("\n"),
  });
});

function addRing({ pointCount, pointModifiers, pos, radius }) {
  let points = [];

  const startModifier = randomInt(0, pointCount - 1);

  for (let i = 0; i < pointCount; i++) {
    const angle = (360 / pointCount) * i;
    points.push(
      angledPositionFromPoint({
        angle,
        point: pos,
        distance: radius * pointModifiers[i],
      })
    );
  }

  return {
    ring: `
      <path
        d="${spline(points, 1, true)}"
        fill="none"
        stroke="#000"
      />
    `,
    points,
  };
}

function constrainIndex(index, array) {
  const length = array.length;

  if (index >= length) {
    index -= length;
  }
  if (index < 0) {
    index += length;
  }

  return index;
}
