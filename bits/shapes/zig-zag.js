export function zigZag(points, close) {
  console.log(points);
  let path = `M${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += `L${points[i].x} ${points[i].y}`;
  }

  if (close) {
    path += "Z";
  }

  return path;
}
