import { buildSvg } from "../../helpers/build-svg.js";
import { buildFunctionEndpoint } from "../../helpers/build-function-endpoint.js";
import { randomHsl } from 'randomness-helpers';

export const handler = buildFunctionEndpoint(() => {  
  return buildSvg({content: `<circle cx='50' cy='50' r='25' fill="${randomHsl({l: 50})}"/>`});
});