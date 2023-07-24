import { randomDegree } from "randomness-helpers";
import { angledPositionFromPoint } from "../../helpers/angled-position-from-point.js";

export function spiralPoints({ x, y, r, angle = randomDegree() }) {
  const points = [];

  const delta = r / 50;

  let distance = 0;

  while (distance < r) {
    const newPoint = angledPositionFromPoint({
      angle,
      distance,
      point: { x, y },
    });
    points.push(newPoint);

    distance += delta;
    angle += 30;
  }

  return points;
}
