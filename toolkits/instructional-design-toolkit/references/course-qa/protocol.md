# /course-qa — protocol SSOT

Harness-agnostic body. Thin entry: `commands/course-qa.md`.

---

# Course QA: $ARGUMENTS

You are running a **release-readiness QA audit** on a published (or
about-to-publish) course — the course as a learner experiences it, not the
course as it was designed. This is the complement of `/course-audit`:

| | `/course-audit` | `/course-qa` (this) |
|---|---|---|
| Audits | The design — `course.json` / markdown source vs framework + cmi5 invariants | The live experience — what a learner actually sees |
| Runs against | The authoring repo | The platform (live URL) + the source as reference |
| When | Before/while authoring | Before go-live, after big revisions, on QA sweeps |

Checklist provenance: Alejandro A's published-course QA checklist
(2026-07-10). The eight sections below are the contract; do not skip sections
silently — mark them N/A with a reason.

## Parse `$ARGUMENTS`

- **course-slug** (required): the course to audit.
- `--url`: the live course URL (platform + environment). If omitted, ask which
  environment (staging vs production) the audit targets.
- `--skip-code`: skip section 4 (Code & Hands-on Validation). Use ONLY when
  the course genuinely has no code lessons and no companion repository —
  if any lesson contains commands or code blocks, section 4 applies to THOSE
  (running them locally), even when no companion repo exists.

## How to run it

Work section by section. For anything that requires seeing the live page
(videos loading, images rendering, progress tracking), use the operator's
browser tooling if available; otherwise mark those items `NEEDS-HUMAN` and
list them in the report so a human can verify — never mark an item ✅ that
you did not actually verify. Where the item is verifiable from the source
repo (markdown accuracy, link URLs, code blocks), verify from source AND flag
any suspected source↔platform drift.

## The checklist

### 1. Course Structure

- Title, description, thumbnail present and correct
- Instructor attributed
- Category/tags set
- Difficulty level set (and honest — see the leveling rubric if available)
- Estimated duration plausible vs actual content
- Learning objectives stated
- Module and lesson order is intentional
- No empty or duplicate lessons

### 2. Lesson Content

- Text accuracy (facts, versions, names)
- Grammar/spelling
- Markdown formatting renders (headings, lists, tables)
- Images render correctly (no broken paths — watch locale-tree `../` depth)
- Code blocks display properly (language tags, no truncation)
- No placeholder text (`TBD`, `lorem`, `TODO`) or outdated content

### 3. Video Review

- Video loads (correct environment — a video that never loads is usually a
  cross-environment playback ID)
- Audio quality acceptable
- Resolution/readability (code on screen must be legible)
- Cursor visible in screen recordings
- No editing mistakes
- No dead air or long pauses
- Captions/transcript present (if applicable)

### 4. Code & Hands-on Validation *(conditional — see `--skip-code`)*

- Commands execute successfully (run them, don't eyeball them)
- Code compiles/runs
- Dependencies install (from a clean environment)
- Expected outputs match what the lesson claims
- Companion repository matches the lesson *(only if the course ships one)*

### 5. Resources & Links

- External links work (no 404s)
- Linked documentation is current (not versions behind)
- GitHub repositories accessible (right visibility)
- Downloads/templates available
- No broken or silently-redirected resources

### 6. Exercises & Projects

- Instructions are clear (a learner can start without guessing)
- Required files exist
- Expected outcome is defined
- Solutions/reference implementations available (if intended)

### 7. Course Flow

- Lessons progress logically
- Prerequisites are respected (nothing used before it's taught)
- No knowledge gaps between lessons
- Smooth transitions
- Final project aligns with the course objectives

### 8. Completion Review

- Complete the course beginning-to-end as a learner (`NEEDS-HUMAN` if you
  cannot drive the platform)
- Progress tracking works
- All lessons can be marked complete
- The learner can achieve the stated outcome without missing information

## PASS criteria

A course is ready **only if** all of these hold:

- ✅ All videos work
- ✅ All content is accurate
- ✅ All code has been verified (or the course provably has none)
- ✅ All links/resources work
- ✅ Exercises are completable
- ✅ Course flow is coherent
- ✅ Full end-to-end learner review passes

One ❌ ⇒ the course is **NOT ready**; there is no partial pass.

## Report — Bilingual Format (per /spec-recommend)

The report follows the **Bilingual Format** (Human Layer + Agent Layer) from
the `spec-recommend` convention, so the same document reads as a status update
for humans and as an actionable brief for a follow-up agent. Write it to the
course's audit trail (chimera-academy convention:
`content/courses/{slug}/audits/qa-{env}-{YYYY-MM-DD}.md`; other consumers:
their audit path) and summarize inline.

```markdown
# COURSE QA — {slug} @ {env} — {date}

## 👤 HUMAN LAYER

### Verdict
READY | NOT READY ({N} blockers)

### What a learner hits today
{1-2 paragraphs: the experience as-is, worst problems first}

### Section scoreboard
1 Structure ✅ · 2 Content ✅ · 3 Video ❌ (2 videos won't load) ·
4 Code N/A (--skip-code) · 5 Links ⚠️ · 6 Exercises ✅ · 7 Flow ✅ · 8 E2E NEEDS-HUMAN

## 🤖 AGENT LAYER

### Blockers (one per line: actionable, evidenced)
- [S3] m02/video-01: playback ID unsignable in {env} → re-upload via /upload-video
- ...

### NEEDS-HUMAN queue
- ...

### Verification commands / URLs
- {how a follow-up agent re-checks each fixed item}
```

When the operator confirms, file the follow-up work in the tracker in the same
Bilingual Format — one issue per blocking section (or per course for sweep
audits), unassigned unless ownership is obvious, so the team can self-assign.
