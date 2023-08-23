import { random } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";

export function wonkyCirclePoints({
  startAngle = 0,
  angleStep = 15,
  angleVariation = 10,
  intensity = 0.15,
  r,
  cx,
  cy,
}) {
  const points = [];

  let angle = startAngle;

  while (angle < 360) {
    const distance = r * random(1 - intensity, 1 + intensity);
    points.push(
      angledPositionFromPoint({
        angle,
        point: { x: cx, y: cy },
        distance,
      })
    );
    angle += angleStep + random(-1 * angleVariation, angleVariation);
  }

  return points;
}
