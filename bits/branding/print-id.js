export function printId({ x, y, size = "16px", name, seed, color = "#000" }) {
  return `<text x="${x}" y="${y}" style="
      font-size: ${size};
      font-family: monospace;
      fill: ${color};
    " 
    text-anchor="end"
  >
    ${name} #${seed}
  </text>`;
}
