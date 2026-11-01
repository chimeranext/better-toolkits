#!/usr/bin/env node
// render-pele.mjs — render a Mermaid .mmd statechart to SVG with Pele, using a
// "blueprint" look (light surfaces, thin lines, mark colors for breaks/mayBreak).
//
// Usage: node render-pele.mjs input.mmd output.svg
// Requires: npm i -g pele (https://pele.run/api)
import { render } from "pele";
import { readFileSync, writeFileSync } from "node:fs";

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error("usage: node render-pele.mjs input.mmd output.svg");
  process.exit(2);
}

const source = readFileSync(inFile, "utf8");

// Blueprint theming (default) — bluish background, light blue surfaces, thin lines.
// Mirrors statechart/references/render.md, with a blue-tinted blueprint look.
const blueprintCss = `
.pele {
  --pele-bg: #eef3fb;
  --pele-fg: #131a2a;
  --pele-muted: #516181;
  --pele-line: #2f3f63;
  --pele-surface: #f7fafd;
  --pele-surface-alt: #e3ebf7;
  --pele-border: #9fb3d4;
}
.pele .blue rect { fill: #d3e2f7; }
.pele .orange rect { fill: #f3e0cf; }
.pele .purple rect { fill: #e4dcf5; }
.pele .yellow rect { fill: #f3e5cf; }
.pele .teal rect { fill: #d2e8e6; }
.pele .tan rect { fill: #e7ded4; }
.pele .pink rect { fill: #f5d9ea; }
.pele .breaks rect {
  fill: #ffe9eb !important;
  stroke: #c92432 !important;
  stroke-width: 2.5px !important;
}
.pele .breaks text { fill: #b31e2a !important; }
.pele .mayBreak rect {
  fill: #fff1e0 !important;
  stroke: #d9690a !important;
  stroke-width: 2.5px !important;
}
.pele .mayBreak text { fill: #a14e06 !important; }
.pele .bugPath rect {
  stroke: #1466c9 !important;
  stroke-width: 2.5px !important;
}
.pele .repeats rect {
  stroke: #8a2ec9 !important;
  stroke-width: 2.5px !important;
  stroke-dasharray: 6 3;
}
`;

try {
  const raw = await render(source, {
    limit: 1_000_000,
    outputLimit: 8_000_000,
    maxEdges: 10_000,
  });
  // Raw SVG from Pele; inject the blueprint CSS into a <style> block.
  let svg = raw.svg ?? raw;
  if (typeof svg !== "string") {
    svg = String(svg);
  }
  const style = `<style>${blueprintCss}</style>`;
  if (svg.includes("</svg>")) {
    svg = svg.replace("</svg>", `${style}</svg>`);
  }
  writeFileSync(outFile, svg, "utf8");
  console.error(`[pele] wrote ${outFile}`);
} catch (e) {
  console.error(`[pele] PeleError: ${e.message}`);
  process.exit(1);
}
