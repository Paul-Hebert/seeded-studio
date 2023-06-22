export function buildSvg({
  content,
  viewBoxWidth = 100,
  viewBoxHeight = 100,
  displayWidth,
  displayHeight,
  attributes = "",
}) {
  return `
    <svg 
      viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" 
      width="${displayWidth || viewBoxWidth}" 
      height="${displayHeight || viewBoxHeight}" 
      xmlns="http://www.w3.org/2000/svg"
      ${attributes}
    >
      ${content}
    </svg>
  `;
}
