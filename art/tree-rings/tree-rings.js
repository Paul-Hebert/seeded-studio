import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { random, randomInt } from "randomness-helpers";
import { angleBetweenPoints } from "../../helpers/angle-between-points.js";
import { distanceBetweenPoints } from "../../helpers/distance-between-points.js";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";
import { spline } from "@georgedoescode/spline";

export const handler = buildFunctionEndpoint(() => {
  const centerPos = { x: 500, y: 500 };
  const outerCircleRadius = randomInt(400, 490);

  const innerCircleRadius = randomInt(1, 3);
  const innerCirclePos = {
    x: 500 + randomInt(-100, 100),
    y: 500 + randomInt(-100, 100),
  };

  const ringCount = randomInt(30, 50);
  const rings = [];

  const ringAngleDiff = angleBetweenPoints(innerCirclePos, centerPos);
  const ringPosDiff = distanceBetweenPoints(innerCirclePos, centerPos);

  const ringSizeDelta = (outerCircleRadius - innerCircleRadius) / ringCount;
  const ringPosDelta = ringPosDiff / ringCount;

  let pos = innerCirclePos;
  let radius = innerCircleRadius;

  const pointCount = randomInt(2, 4) * 6;
  const pointOffsets = [];

  for (let i = 0; i < pointCount; i++) {
    pointOffsets.push(randomInt(-5, 5));
  }

  while (radius <= outerCircleRadius) {
    let points = [];

    const angleModifier = rings.length < 10 ? 2 : 1;

    for (let i = 0; i < pointCount; i += angleModifier) {
      const angle = (360 / pointCount) * i;
      points.push(
        angledPositionFromPoint({
          angle,
          point: pos,
          distance: radius + pointOffsets[i],
        })
      );
    }

    rings.push(`
      <path
        d="${spline(points, 1, true)}"
        fill="none"
        stroke="#000"
      />
    `);

    pos = angledPositionFromPoint({
      angle: ringAngleDiff,
      point: pos,
      distance: ringPosDelta * random(0.7, 1.3),
    });
    radius += ringSizeDelta * random(0.7, 1.3);
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
    content: rings.join("\n"),
  });
});
