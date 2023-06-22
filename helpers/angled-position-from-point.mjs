import { degreesToRadians } from "./degrees-to-radians.mjs";

export function angledPositionFromPoint({ angle, point, distance }) {
  // TODO: is this right?
  const angleInRadians = degreesToRadians(angle + 90);
  return {
    x: point.x + Math.sin(angleInRadians) * distance,
    y: point.y + Math.cos(angleInRadians) * distance,
  };
}
