import { writeFileSync, mkdirSync } from "fs";
import prompts from "prompts";

async function generate() {
  const responses = await prompts([
    {
      type: "text",
      name: "title",
      message: "What is the title?",
    },
    {
      type: "text",
      name: "slug",
      message: "What is the slug?",
    },
    {
      type: "text",
      name: "description",
      message: "What is the descriptions?",
      initial: "TODO...",
    },
  ]);

  const { slug, title, description } = responses;

  mkdirSync(`./art/${slug}`);

  writeFileSync(
    `./art/${slug}/${slug}.md`,
    `---
title: ${title}
name: ${slug}
description: ${description}
---`
  );
  writeFileSync(
    `./art/${slug}/${slug}.mjs`,
    `export default function () {
  return "<circle cx='50' cy='50' r='25'/>";
}`
  );
}

generate();
