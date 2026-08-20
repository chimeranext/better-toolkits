#!/usr/bin/env python3
"""
piber_gate.py: the ship gate for a PIBER board.

Reads a markdown document, finds the five nodes (Problem, Insight, Big Idea,
Execution, Results, in English or Spanish), and checks the things that are
mechanically checkable. Judgment stays with the writer; this catches the
failures that are visible in the text.

Usage:
    python piber_gate.py board.md
    python piber_gate.py board.md --lang es --brand "Chimera Coding"
    python piber_gate.py board.md --rendered      # external artifact: node labels must be gone
    python piber_gate.py board.md --words my-refused.txt --strict-quotes

Exit code 0 when the gate is open, 1 when a hard failure is present.

Use versus mention: quoted spans, inline code and fenced blocks are masked
before the lexical checks run, so a document may discuss a refused phrase by
quoting it. Em dashes are checked raw; house style has no quoting exemption.
Escape hatches: `<!-- lint:ignore -->` on a line, or a
`<!-- lint:ignore:start -->` / `<!-- lint:ignore:end -->` block.
"""

import argparse
import os
import re
import sys

EM_DASH = "\u2014"
EN_DASH = "\u2013"

NODE_PATTERNS = {
    "P": r"\b(problem|problema)\b",
    "I": r"\b(insight|insights)\b",
    "B": r"\b(big\s+idea|gran\s+idea)\b",
    "E": r"\b(execution|ejecuci[oó]n)\b",
    "R": r"\b(results?|resultados?)\b",
}

NODE_NAMES = {
    "P": "Problem",
    "I": "Insight",
    "B": "Big Idea",
    "E": "Execution",
    "R": "Results",
}

BET_MARKERS = [
    "falsifiable bet",
    "the bet",
    "apuesta falsable",
    "la apuesta",
    "we would be wrong",
    "would prove us wrong",
    "nos equivocamos si",
]

STOPWORDS = set(
    """a an the and or but of to in on for with without by from as at is are was were be been being
    that this these those it its their our your his her not no nor so than then there here what which
    who whom how when where why can could should would will shall may might must do does did done have
    has had having more most less least very much many few all any some each every other another same
    el la los las un una unos unas y o pero de del a en para por con sin sobre como que se su sus lo al
    es son era eran ser sido siendo este esta estos estas eso esa ese no ni mas menos muy mucho muchos
    todo toda todos todas cada otro otra mismo misma cuando donde porque quien cual""".split()
)


# ---------------------------------------------------------------- masking


def mask_text(text, strict_quotes=False):
    """Blank out mentions so lexical checks only see use. Offsets preserved."""
    out = list(text)

    def blank(start, end):
        for i in range(start, min(end, len(out))):
            if out[i] != "\n":
                out[i] = " "

    for m in re.finditer(r"```.*?```", text, re.S):
        blank(m.start(), m.end())
    for m in re.finditer(r"`[^`\n]*`", text):
        blank(m.start(), m.end())
    for m in re.finditer(r"<!--\s*lint:ignore:start\s*-->.*?<!--\s*lint:ignore:end\s*-->", text, re.S):
        blank(m.start(), m.end())

    for m in re.finditer(r"^.*<!--\s*lint:ignore\s*-->.*$", text, re.M):
        blank(m.start(), m.end())

    if not strict_quotes:
        for pat in [r"\"[^\"\n]{0,400}\"", r"\u201c[^\u201d\n]{0,400}\u201d", r"'[^'\n]{2,400}'"]:
            for m in re.finditer(pat, text):
                blank(m.start(), m.end())

    return "".join(out)


# ---------------------------------------------------------------- parsing


def line_of(text, index):
    return text.count("\n", 0, index) + 1


def find_sections(text):
    """Return {node: (heading_line, body_text)} for whichever nodes are found."""
    headings = []
    for m in re.finditer(r"^(#{1,6})\s*(.+?)\s*$", text, re.M):
        headings.append((m.start(), m.end(), m.group(2)))
    for m in re.finditer(r"^\*\*([^*\n]{1,60})\*\*\s*$", text, re.M):
        headings.append((m.start(), m.end(), m.group(1)))
    headings.sort(key=lambda h: h[0])

    # First pass: which headings name a node. Sub-headings inside a node stay
    # inside it, so a body runs until the next node heading, not the next heading.
    tagged = []
    claimed = set()
    for start, end, title in headings:
        clean = re.sub(r"^[\s\d.)\-:]*", "", title)
        clean = re.sub(r"^[PIBER]\.\s*", "", clean)
        node = None
        if len(clean.split()) <= 6:
            for candidate, pat in NODE_PATTERNS.items():
                if candidate not in claimed and re.search(pat, clean, re.I):
                    node = candidate
                    claimed.add(candidate)
                    break
        tagged.append((start, end, node))

    node_starts = [t[0] for t in tagged if t[2]]
    sections = {}
    for start, end, node in tagged:
        if not node:
            continue
        later = [s for s in node_starts if s > start]
        body_end = later[0] if later else len(text)
        sections[node] = (line_of(text, start), text[end:body_end])
    return sections


def first_content_line(body):
    for raw in body.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if re.match(r"^(\*\*[^*]+\*\*\s*:|[-*+]\s|\|)", line):
            continue
        line = re.sub(r"^>\s*", "", line)
        line = re.sub(r"^#{1,6}\s*", "", line)
        line = line.strip("*_ ").strip()
        if line:
            return line
    return ""


def sentences(text):
    flat = re.sub(r"\s+", " ", text).strip()
    if not flat:
        return []
    parts = re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡\"'(])", flat)
    return [p.strip() for p in parts if p.strip()]


def content_words(text):
    words = re.findall(r"[a-záéíóúñü]{3,}", text.lower())
    return {w for w in words if w not in STOPWORDS}


def load_lexicon(path, lang):
    """Parse the refused-lines file into {section: [entries]}."""
    buckets = {"insight-openers": [], "cliche-en": [], "cliche-es": [], "vanity": [], "hedge": []}
    if not path or not os.path.exists(path):
        return buckets, False
    current = None
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            m = re.match(r"^\[(.+)\]$", line)
            if m:
                current = m.group(1).strip().lower()
                buckets.setdefault(current, [])
                continue
            if current:
                buckets[current].append(line.lower())
    if lang == "en":
        buckets["cliche-es"] = []
    elif lang == "es":
        buckets["cliche-en"] = []
    return buckets, True


# ---------------------------------------------------------------- checks


class Report:
    def __init__(self):
        self.hard = []
        self.warn = []
        self.note = []

    def fail(self, msg, line=None):
        self.hard.append((line, msg))

    def warning(self, msg, line=None):
        self.warn.append((line, msg))

    def info(self, msg):
        self.note.append(msg)


def check(text, args):
    rep = Report()
    masked = mask_text(text, strict_quotes=args.strict_quotes)
    lex, lex_found = load_lexicon(args.words, args.lang)
    if not lex_found:
        rep.info("Refused lexicon not found. Lexical checks skipped. Pass --words to enforce them.")

    # House style. Checked raw: no quoting exemption.
    for m in re.finditer(re.escape(EM_DASH), text):
        rep.fail("Em dash. House style bans it. Use a comma, colon, semicolon or parentheses.", line_of(text, m.start()))
    for m in re.finditer(re.escape(EN_DASH) + r"(?![0-9])", text):
        rep.warning("En dash used as punctuation. Prefer a comma or parentheses.", line_of(text, m.start()))
    for m in re.finditer(r"!(?!=)", masked):
        rep.warning("Exclamation mark. Conviction comes from the claim, not the punctuation.", line_of(text, m.start()))

    sections = find_sections(text)
    missing = [NODE_NAMES[n] for n in "PIBER" if n not in sections]
    if missing and not args.rendered:
        rep.fail("Missing node(s): " + ", ".join(missing) + ". A board carries all five.")
    if args.rendered and not missing:
        rep.warning(
            "Rendered artifact still carries all five node labels as headings. "
            "Outside a case board, the beats stay and the labels go."
        )

    # ---- Insight
    if "I" in sections:
        i_line, i_body = sections["I"]
        insight = first_content_line(i_body)
        if not insight:
            rep.fail("Insight section has no statement in it.", i_line)
        else:
            sents = sentences(insight)
            wc = len(insight.split())
            if len(sents) > 2:
                rep.fail(f"Insight runs {len(sents)} sentences. One sentence. Choose.", i_line)
            if wc > 45:
                rep.fail(f"Insight is {wc} words. Ceiling is 45. It has to be sayable out loud.", i_line)
            elif wc > 30:
                rep.warning(f"Insight is {wc} words. Under 30 lands harder.", i_line)
            if re.search(r"\s+and\s+.+\s+and\s+", insight, re.I):
                rep.warning("Insight staples multiple thoughts with 'and'. Choose one.", i_line)
            if args.brand and re.search(re.escape(args.brand), insight, re.I):
                rep.fail(
                    f"Insight contains the brand name ({args.brand}). "
                    "The insight belongs to the world. Ownership shows up in the Big Idea.",
                    i_line,
                )
            low = insight.lower()
            for opener in lex.get("insight-openers", []):
                if opener in low:
                    rep.fail(f"Insight uses a refused construction: '{opener}'. It signals no search occurred.", i_line)
            if "P" in sections:
                p_words = content_words(sections["P"][1])
                i_words = content_words(insight)
                if i_words:
                    overlap = len(p_words & i_words) / len(i_words)
                    if overlap >= 0.6:
                        rep.fail(
                            f"Insight shares {overlap:.0%} of its content words with the Problem. "
                            "This is the double P: the problem restated, no turn.",
                            i_line,
                        )
                    elif overlap >= 0.45:
                        rep.warning(
                            f"Insight shares {overlap:.0%} of its content words with the Problem. "
                            "Check that it is a turn and not a restatement.",
                            i_line,
                        )

    # ---- Big Idea
    if "B" in sections:
        b_line, b_body = sections["B"]
        idea = first_content_line(b_body)
        if not idea:
            rep.fail("Big Idea section has no idea in it.", b_line)
        else:
            words = len(re.findall(r"\S+", idea))
            if words > 12:
                rep.fail(f"Big Idea line runs {words} words. It is a paragraph, not an idea. Ceiling is 7.", b_line)
            elif words > 7:
                rep.warning(f"Big Idea line runs {words} words. Three to five is the target.", b_line)
            if re.search(r"\b(platform|solution|ecosystem|plataforma|soluci[oó]n|ecosistema)\b", idea, re.I):
                rep.warning("Big Idea leans on a category noun. Categories are not ideas.", b_line)

    # ---- Execution
    if "E" in sections:
        e_line, e_body = sections["E"]
        if not re.search(r"(→|->|traces to|traza a|because|porque)", e_body, re.I):
            rep.warning(
                "Execution shows no traces back to the Insight. Draw the arrows, then cut what does not trace.",
                e_line,
            )
        if len(e_body.split()) < 40:
            rep.warning("Execution is thin. It is the proof node and normally the longest one.", e_line)

    # ---- Results
    if "R" in sections:
        r_line, r_body = sections["R"]
        r_masked = mask_text(r_body, strict_quotes=args.strict_quotes)
        has_digits = bool(re.search(r"\d", r_masked))
        has_bet = any(marker in r_body.lower() for marker in BET_MARKERS)
        if not has_digits and not has_bet:
            rep.fail(
                "Results has no numbers and no falsifiable bet. "
                "If nothing shipped, state the number, the date, and what would prove you wrong.",
                r_line,
            )
        vanity_hits = [v for v in lex.get("vanity", []) if re.search(r"\b" + re.escape(v) + r"\b", r_masked, re.I)]
        if vanity_hits and not re.search(
            r"(revenue|arr|mrr|renewal|conversion|retention|ingresos|ventas|renovaci|conversi|retenci)",
            r_masked,
            re.I,
        ):
            rep.warning(
                "Results lead with activity metrics (" + ", ".join(sorted(set(vanity_hits))) + ") "
                "and no money or behavior tier. Find what people did differently.",
                r_line,
            )
        if has_digits and not re.search(r"(vs\.?|versus|against|baseline|from\s+\d|up from|contra|frente a|de\s+\d+\s+a\s+\d+|%)", r_masked, re.I):
            rep.warning("Numbers appear without a denominator or a baseline. A number needs a before.", r_line)

    # ---- Lexicon sweep over the whole document
    for bucket, severity in (
        ("cliche-en", "warn"),
        ("cliche-es", "warn"),
        ("insight-openers", "warn"),
        ("hedge", "note"),
    ):
        for phrase in lex.get(bucket, []):
            for m in re.finditer(re.escape(phrase), masked, re.I):
                msg = f"Refused phrase: '{phrase}'."
                if severity == "warn":
                    rep.warning(msg, line_of(text, m.start()))
                else:
                    rep.warning("Hedge: '" + phrase + "'. Say it or cut it.", line_of(text, m.start()))

    # ---- Prose density
    offset = 0
    for raw_line in masked.split("\n"):
        stripped = raw_line.strip()
        if stripped and not stripped.startswith("|"):
            for s in sentences(stripped):
                n = len(s.split())
                if n > 35:
                    rep.warning(
                        f"Sentence runs {n} words. Over 35 the argument stops being felt.",
                        line_of(text, offset),
                    )
        offset += len(raw_line) + 1

    return rep


# ---------------------------------------------------------------- output


def main():
    ap = argparse.ArgumentParser(description="Ship gate for a PIBER board.")
    ap.add_argument("path")
    ap.add_argument("--lang", choices=["en", "es", "both"], default="both")
    ap.add_argument("--brand", default=None, help="Brand name that must not appear inside the Insight.")
    ap.add_argument("--rendered", action="store_true", help="External artifact: node labels should be gone.")
    ap.add_argument("--strict-quotes", action="store_true", help="Do not exempt quoted spans.")
    ap.add_argument(
        "--words",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "refused-lines.txt"),
    )
    args = ap.parse_args()

    if not os.path.exists(args.path):
        print(f"File not found: {args.path}")
        return 2
    with open(args.path, encoding="utf-8") as fh:
        text = fh.read()

    rep = check(text, args)

    def emit(items, label):
        if not items:
            return
        print(f"\n{label} ({len(items)})")
        seen = set()
        for line, msg in items:
            key = (line, msg)
            if key in seen:
                continue
            seen.add(key)
            where = f"L{line}" if line else "  "
            print(f"  {where:>6}  {msg}")

    print(f"PIBER gate: {os.path.basename(args.path)}")
    emit(rep.hard, "HARD FAILURES")
    emit(rep.warn, "WARNINGS")
    for n in rep.note:
        print(f"\nNOTE  {n}")

    print()
    if rep.hard:
        print(f"GATE CLOSED. {len(rep.hard)} hard failure(s), {len(rep.warn)} warning(s). Recut and rerun.")
        return 1
    print(f"GATE OPEN. 0 hard failures, {len(rep.warn)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
