import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt } from "randomness-helpers";
import { angleBetweenPoints } from "../../helpers/angle-between-points.js";
import { distanceBetweenPoints } from "../../helpers/distance-between-points.js";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";

export const handler = buildFunctionEndpoint(() => {
  const centerPos = { x: 500, y: 500 };
  const outerCircleRadius = randomInt(300, 350);

  const innerCircleRadius = -8;
  const innerCirclePos = {
    x: 500 + randomInt(-100, 100),
    y: 500 + randomInt(-100, 100),
  };

  const ringCount = randomInt(50, 80);
  const rings = [];

  const ringAngleDiff = angleBetweenPoints(innerCirclePos, centerPos);
  const ringPosDiff = distanceBetweenPoints(innerCirclePos, centerPos);

  const ringSizeDelta = (outerCircleRadius - innerCircleRadius) / ringCount;
  const ringPosDelta = ringPosDiff / ringCount;

  let pos = innerCirclePos;
  let radius = innerCircleRadius;

  const pointCount = randomInt(100, 200);
  const pointModifiers = [];
  const modifierRange = 0.0054;

  for (let i = 0; i < pointCount; i++) {
    pointModifiers.push(random(1 - modifierRange, 1 + modifierRange));
  }

  let lastRingPoints;

  while (radius <= outerCircleRadius) {
    pos = angledPositionFromPoint({
      angle: ringAngleDiff,
      point: pos,
      distance: ringPosDelta * random(0.7, 1.3),
    });
    radius += ringSizeDelta * random(0.7, 1.3);

    const newRing = addRing({ pointCount, pointModifiers, pos, radius });
    rings.push(newRing.ring);
    lastRingPoints = newRing.points;
  }

  for (let i = 0; i < 5; i++) {
    rings.push(
      addRing({
        pointCount,
        pointModifiers,
        pos,
        radius: (radius += random(-3, 3)),
      }).ring
    );
  }

  radius += randomInt(20, 50);

  const barkRing = addRing({ pointCount, pointModifiers, pos, radius });

  rings.push(barkRing.ring);

  const barkLines = [];

  for (let i = 0; i < barkRing.points.length; i++) {
    for (let z = -2; z <= 2; z++) {
      let index = i + z + randomInt(-3, 3);
      if (index < 0) {
        index += pointCount;
      }
      if (index > pointCount - 1) {
        index -= pointCount;
      }

      barkLines.push(`
        <line 
          x1="${barkRing.points[i].x}"
          y1="${barkRing.points[i].y}"
          x2="${lastRingPoints[index].x}"
          y2="${lastRingPoints[index].y}"
          stroke="#000" 
          fill="none"
        />
      `);
      barkLines.push(`
        <line 
          x1="${barkRing.points[index].x}"
          y1="${barkRing.points[index].y}"
          x2="${lastRingPoints[i].x}"
          y2="${lastRingPoints[i].y}"
          stroke="#000" 
          fill="none"
        />
      `);
    }
  }

  for (let i = 0; i < 5; i++) {
    rings.push(
      addRing({
        pointCount,
        pointModifiers,
        pos,
        radius: (radius += random(-2, 2)),
      }).ring
    );
  }

  // rings.push(`
  //     <circle
  //       cx='${centerPos.x}'
  //       cy='${centerPos.y}'
  //       r='${outerCircleRadius}'
  //       fill="none"
  //       stroke="green"
  //     />
  //   `);

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
