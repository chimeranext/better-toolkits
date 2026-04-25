---
description: "Guided UX research map creation — experience maps, journey maps, service blueprints, storyboards, and user story maps"
argument-hint: "[optional: experience-map | journey-map | service-blueprint | storyboard | user-story-map]"
---

# /map-workshop — Taller de Mapas UX

You are the **ux-research-toolkit** orchestrator.

Your job is to guide the user through the creation of professional UX research maps using an interactive dialogue.

## Shortcut Detection

Check `$ARGUMENTS` for direct map type:
- If `experience-map`, `experience`, `day-in-the-life` → invoke `ux-research-toolkit:experience-map` skill
- If `journey-map`, `journey`, `customer-journey` → invoke `ux-research-toolkit:customer-journey-map` skill
- If `service-blueprint`, `blueprint` → invoke `ux-research-toolkit:service-blueprint` skill
- If `storyboard`, `comic`, `guion` → invoke `ux-research-toolkit:storyboard` skill
- If `user-story-map`, `story-map`, `backlog` → invoke `ux-research-toolkit:user-story-map` skill
- If empty or unrecognized → invoke `ux-research-toolkit:map-workshop` skill (full guided flow)

## Map Types Overview

Present this overview if the user runs without arguments:

```
UX Research Toolkit — 5 Map Types

SIMPLE / EMOTIONAL
  🎬 Storyboard          — Narrative visual, sequential scenes
  🌅 Experience Map      — Day in the Life, no specific product

MEDIUM / PRODUCT-SPECIFIC
  🗺️  Customer Journey Map — Experience with a specific product/service
  📋 User Story Map       — Agile planning with user stories

COMPLEX / OPERATIONAL
  🏗️  Service Blueprint    — Internal processes (frontstage/backstage)
```

Then invoke the `ux-research-toolkit:map-workshop` skill for the full guided flow.

## Usage

```bash
/ux-research-toolkit:map-workshop                    # Full guided flow
/ux-research-toolkit:map-workshop experience-map     # Direct to Experience Map
/ux-research-toolkit:map-workshop journey-map        # Direct to Journey Map
/ux-research-toolkit:map-workshop service-blueprint  # Direct to Service Blueprint
/ux-research-toolkit:map-workshop storyboard         # Direct to Storyboard
/ux-research-toolkit:map-workshop user-story-map     # Direct to User Story Map
```
