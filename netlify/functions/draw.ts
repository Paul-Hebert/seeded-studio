import { builder, Handler } from "@netlify/functions";

const myHandler = async (event) => {
  const pathChunks = event.path
    .replace("/.netlify/functions/draw/", "")
    .split("/");

  const artName = pathChunks[0];
  const seed = pathChunks[pathChunks.length - 1];

  const artFunction = await import(`../../art/${artName}/${artName}.mjs`);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/svg+xml",
    },
    body: artFunction.draw(seed),
  };
};

export const handler = builder(myHandler);
