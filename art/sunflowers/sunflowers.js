import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { randomHsl } from "randomness-helpers";

export const handler = buildFunctionEndpoint(() => {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  let content = `<circle cx='50' cy='50' r='25' fill="${randomHsl({
    l: 50,
  })}"/>`;

  return buildSvg({
    viewBoxWidth,
    viewBoxHeight,
    content,
  });
});
