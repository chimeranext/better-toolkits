---
description: How to render the pipeline diagram (pipeline-overview.md) with Pele or Mintlify.
argument-hint: ""
priority: 68
---
# Rendering the pipeline diagram

The diagram in `pipeline-overview.md` renders with either tool.

## Pele

```bash
npm install pele
```

```js
import { render } from 'pele';
const { svg } = render(diagramText);
document.querySelector('#pipeline').innerHTML = svg;
```

The `mermaid` block renders through Pele.
It needs no other tool.
The `flowchart TD` syntax with double quotes for nodes holding `/` meets `mermaid-github` D0-D6.

## Mintlify

Mintlify renders `mermaid` native.
Include the file.
No extra configuration is needed.
