// https://stackoverflow.com/a/47653643/7816145
export function angleBetweenPoints(origin, target) {
  var dx = origin.x - target.x;
  var dy = origin.y - target.y;

  var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
  theta *= 180 / Math.PI; // [0, 180] then [-180, 0]; clockwise; 0° = east
  if (theta < 0) theta += 360; // [0, 360]; clockwise; 0° = east

  return theta;
}
