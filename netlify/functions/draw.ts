import { builder, Handler } from "@netlify/functions";
import { setSeed } from "randomness-helpers";

const myHandler: Handler = async (event) => {
  const pathChunks = event.path
    .replace("/.netlify/functions/draw/", "")
    .split("/");

  const artName = pathChunks[0];
  const seed = pathChunks[pathChunks.length - 1];

  setSeed(seed);

  const artFunction = await import(`../../art/${artName}/${artName}.mjs`);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/svg+xml",
    },
    body: `
      <svg viewBox="0 0 100 100" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        ${artFunction.default()}
      </svg>
    `,
  };
};

export const handler = builder(myHandler);
