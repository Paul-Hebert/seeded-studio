import { degreesToRadians } from "./degrees-to-radians.mjs";

export function angledPositionFromPoint({ angle, point, distance }) {
  const angleInRadians = degreesToRadians(angle);
  return {
    x: point.x + Math.sin(angleInRadians) * distance,
    y: point.y + Math.cos(angleInRadians) * distance,
  };
}
