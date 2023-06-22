import { builder, Handler } from "@netlify/functions";
import { setSeed } from "randomness-helpers";

const myHandler = async (event) => {
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
    body: artFunction.draw(),
  };
};

export const handler = builder(myHandler);
