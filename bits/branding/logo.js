export function logo({ x, y, size = "16px", color = "#000" }) {
  return `<text x="${x}" y="${y}" style="
    font-size: ${size}; 
    font-family: monospace;
    fill: ${color};
  ">
    seeded.studio
  </text>`;
}
