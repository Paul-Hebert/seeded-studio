import { Event } from "@netlify/functions/dist/function/event";

export function getSeed(event: Event) {
  const pathChunks = event.path.split("/");

  return pathChunks[pathChunks.length - 1];
}
