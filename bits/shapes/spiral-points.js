import { randomDegree } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";

export function spiralPoints({
  x,
  y,
  r,
  angle = randomDegree(),
  angleChange = 30,
  deltaMod = 50,
}) {
  const points = [];

  const delta = r / deltaMod;

  let distance = 0;

  while (distance < r) {
    const newPoint = angledPositionFromPoint({
      angle,
      distance,
      point: { x, y },
    });
    points.push(newPoint);

    distance += delta;
    angle += angleChange;
  }

  return points;
}
