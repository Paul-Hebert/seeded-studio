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
    `./art/${slug}/${slug}.js`,
    `import { buildSvg } from "../../helpers/build-svg.js";
import { setSeed, randomHsl } from 'randomness-helpers';

export function draw (seed) {
  setSeed(seed);
  
  return buildSvg({content: \`<circle cx='50' cy='50' r='25' fill="\${randomHsl({l: 50})}"/>\`});
}`
  );
}

generate();
