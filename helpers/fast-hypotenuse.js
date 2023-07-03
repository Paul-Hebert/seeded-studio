// https://stackoverflow.com/questions/71898044/why-is-math-hypot-so-slow
export function fastHypotenuse(x, y) {
  return Math.sqrt(x * x + y * y);
}
