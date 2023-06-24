import { builder } from "@netlify/functions";

export function buildFunctionEndpoint(drawFunction) {
  const myHandler = async (event) => {
    const pathChunks = event.path
      .replace("/.netlify/functions/draw/", "")
      .split("/");

    const seed = pathChunks[pathChunks.length - 1];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
      body: drawFunction(seed),
    };
  };

  return builder(myHandler);
}
