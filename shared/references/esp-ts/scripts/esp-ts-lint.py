#!/usr/bin/env python3
"""Deterministic linter for ESP-TS (Español Técnico Simplificado).

Mirrors the structural mechanism of ASD-STE100 `asd-ste100-lint.py`, adapted for
Spanish customer-facing and controlled-Spanish prose. Lexical SSOT is
`../vocabulary.yml` (vendored from esadrian/este-skill).

Usage:
    esp-ts-lint.py FILE [FILE ...]
    echo "texto" | esp-ts-lint.py [--json]
    esp-ts-lint.py --baseline 5 FILE
    esp-ts-lint.py --disable se-impersonal,vocabulary-avoid FILE
    esp-ts-lint.py --selftest

Exit 1 when hard ("advisory-free") violations exceed the baseline (default 0).
Advisory findings never fail the run.
Exit 2 on usage error or missing PyYAML / unreadable vocabulary.
"""
from __future__ import annotations

import argparse
import contextlib
import importlib.util
import io
import json
import os
import re
import sys
import tempfile
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

HERE = Path(__file__).resolve().parent
ESP_TS_ROOT = HERE.parent
VOCAB_PATH = ESP_TS_ROOT / "vocabulary.yml"
STE_LINT_PATH = (
    ESP_TS_ROOT.parent / "asd-ste100" / "scripts" / "asd-ste100-lint.py"
)


def _load_ste():
    """Import asd-ste100-lint helpers for Markdown prose extraction (same mechanism)."""
    if not STE_LINT_PATH.is_file():
        raise FileNotFoundError(f"asd-ste100-lint.py not found at {STE_LINT_PATH}")
    spec = importlib.util.spec_from_file_location("asd_ste100_lint_shared", STE_LINT_PATH)
    if spec is None or spec.loader is None:
        raise ImportError(f"cannot load {STE_LINT_PATH}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ste = _load_ste()

MAX_WORDS = 25  # ESTE-006 descriptions cap (instructions 20; context-free → 25)

# Structural / voice heuristics (IDs align with ESTE-* where mechanical).
RULES = [
    ("semicolon", "advisory",
     re.compile(r";"),
     "ESP-TS (ESTE-007): evita el punto y coma como unión de oraciones. "
     "Prefiere dos oraciones."),
    ("se-impersonal", "advisory-free",
     re.compile(
         r"\bse\s+(?:procede(?:\s+a)?|debe|deberá|puede|podrá|realiza|"
         r"realizará|elimina|eliminará|inicia|iniciará|detiene|detendrá|"
         r"actualiza|actualizará|despliega|desplegará|configura|configurará|"
         r"verifica|verificará|ejecuta|ejecutará)\b",
         re.I,
     ),
     "ESP-TS (ESTE-009): se impersonal ambiguo. Nombra el actor y usa voz activa."),
    ("vague-realizar", "advisory-free",
     re.compile(r"\b(?:realizar|realiza|realizan|realizará|realizarán|"
                r"llevar\s+a\s+cabo|proceder\s+a|procede\s+a)\b", re.I),
     "ESP-TS (ESTE-016 / vocabulario): verbo vago. Sustitúyelo por el verbo concreto."),
    ("marketing-adjective", "advisory-free",
     re.compile(
         r"\b(?:robusto|robusta|robustos|robustas|seamless|sin\s+fricci[oó]n|"
         r"de\s+clase\s+mundial|vanguardista|revolucionario|revolucionaria|"
         r"cutting[- ]edge|estado\s+del\s+arte)\b",
         re.I,
     ),
     "Adjetivo de marketing. Elimínalo o sustitúyelo por la medida que lo justifica."),
]

CONJUNCTION_END_ES = re.compile(r"\b(?:y|e|o|u)\s*$", re.I)

# Placeholders / meta avoid tokens in vocabulary.yml that are not real prose.
_SKIP_AVOID = frozenset({
    "fallo_ambiguo", "proceso_ambiguo", "hacer_deploy", "clave_temporal",
})


def _word_boundary_pattern(term: str) -> re.Pattern[str]:
    """Match a vocabulary term as a whole token (multi-word aware)."""
    parts = [re.escape(p) for p in term.split() if p]
    if not parts:
        return re.compile(r"(?!x)x")  # never matches
    body = r"\s+".join(parts)
    return re.compile(rf"(?<!\w){body}(?!\w)", re.I)


def _flex_pattern(term: str) -> re.Pattern[str]:
    """Match a term allowing light Spanish verb/noun inflection (ESTE-001)."""
    term = term.strip()
    if not term or " " in term:
        return _word_boundary_pattern(term)
    lower = term.lower()
    if len(lower) > 3 and lower.endswith(("ar", "er", "ir")):
        stem = re.escape(lower[:-2])
        return re.compile(rf"(?<!\w){stem}\w{{1,8}}(?!\w)", re.I)
    return _word_boundary_pattern(term)


def load_vocabulary(path: Path = VOCAB_PATH):
    """Load avoid terms and bad phrases from vocabulary.yml."""
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as e:
        print(f"cannot read vocabulary {path}: {e}", file=sys.stderr)
        sys.exit(2)
    if not isinstance(data, dict):
        print(f"vocabulary {path} is not a mapping", file=sys.stderr)
        sys.exit(2)

    avoid_rules = []
    for term in data.get("terms") or []:
        preferred = (term.get("preferred") or "").strip()
        concept = term.get("concept") or ""
        status = term.get("status") or "preferred"
        for raw in term.get("avoid") or []:
            avoid = str(raw).strip()
            if not avoid or avoid in _SKIP_AVOID or "_" in avoid:
                continue
            # "mismo / dicha / referido" style lists are phrases, not single avoids
            if " / " in avoid:
                continue
            level = "advisory-free"
            if status == "preferred" and avoid in {
                "mirar", "revisar", "validar", "cliente", "persona", "cuenta",
                "problema", "parar", "borrar", "quitar", "refrescar",
            }:
                # Common Spanish synonyms — advisory to limit CFM false positives.
                level = "advisory"
            msg = (
                f"ESP-TS vocabulario ({concept}): evita «{avoid}»."
                + (f" Prefiere «{preferred}»." if preferred
                   and not preferred.startswith("<") else "")
            )
            avoid_rules.append((avoid, _word_boundary_pattern(avoid), level, msg))

    phrase_rules = []
    for phrase in data.get("phrases") or []:
        bad = (phrase.get("bad") or "").strip()
        good = (phrase.get("good") or "").strip()
        if not bad:
            continue
        # Skip meta entries that are slash-lists, not fixed phrases.
        if " / " in bad or "(" in bad:
            continue
        msg = f"ESP-TS frase a evitar: «{bad}»."
        if good:
            msg += f" Prefiere: {good}."
        phrase_rules.append((bad, _word_boundary_pattern(bad), "advisory-free", msg))

    return avoid_rules, phrase_rules


VOCAB_AVOID, VOCAB_PHRASES = load_vocabulary()


def _dangling_conjunction_findings(text, filename):
    """Spanish list-item dangling y/e/o/u (same shape as asd-ste100-lint)."""
    lines = text.splitlines()
    findings = []
    fence = None
    index = 0
    while index < len(lines):
        line = lines[index]
        is_fence, fence = ste._fence_step(fence, line)
        if is_fence or fence:
            index += 1
            continue
        start = ste.LIST_ITEM_START.match(line)
        if not start:
            index += 1
            continue

        content_indent = (
            len(start.group("indent"))
            + len(start.group("marker"))
            + len(start.group("gap"))
        )
        item_lines = [(index, start.group("body"))]
        next_index = index + 1
        item_fence = None
        while next_index < len(lines):
            candidate = lines[next_index]
            if ste._fence_ends_with_quote(item_fence, candidate):
                item_fence = None
            if (
                item_fence is None
                and not ste._is_list_continuation(candidate, content_indent)
            ):
                break
            is_fence, item_fence = ste._fence_step(item_fence, candidate)
            if is_fence or item_fence:
                next_index += 1
                continue
            item_lines.append((next_index, candidate))
            next_index += 1

        meaningful = []
        for line_index, item_line in item_lines:
            cleaned = ste.INLINE_CODE.sub(" CODE ", item_line).strip()
            if cleaned:
                meaningful.append((line_index, cleaned))
        if meaningful:
            end_line_index, end_line = meaningful[-1]
            conjunction = CONJUNCTION_END_ES.search(end_line)
        else:
            end_line_index, end_line, conjunction = None, None, None
        if conjunction:
            if end_line_index == index:
                finding_line = index + 1
                finding_col = start.start("marker") + 1
            else:
                raw_end_line = next(
                    raw for line_index, raw in item_lines
                    if line_index == end_line_index
                )
                masked_end_line = ste.INLINE_CODE.sub(
                    lambda match: " " * len(match.group(0)), raw_end_line
                )
                raw_conjunction = CONJUNCTION_END_ES.search(masked_end_line)
                assert end_line_index is not None
                finding_line = end_line_index + 1
                finding_col = raw_conjunction.start() + 1 if raw_conjunction else 1
            findings.append({
                "file": filename,
                "line": finding_line,
                "col": finding_col,
                "rule": "dangling-conjunction",
                "level": "advisory-free",
                "match": end_line,
                "message": (
                    "El ítem de lista termina en conjunción coordinante. "
                    "Complétalo o únelo con el siguiente ítem."
                ),
            })
        index = next_index
    return findings


def _long_sentence_findings(pieces, filename):
    """Reuse ste sentence splitter; ESP-TS message (ESTE-006)."""
    findings = ste._long_sentence_findings(pieces, filename)
    for f in findings:
        n = int(f["match"].split()[0])
        f["message"] = (
            f"ESP-TS (ESTE-006): la oración tiene {n} palabras "
            f"(tope {MAX_WORDS}). Sepárala."
        )
    return findings


def lint(text, filename="<stdin>"):
    text = ste._blank_front_matter(text)
    findings = []
    words_total = 0
    fence = None
    html_block = None
    in_paragraph = False
    html_containers = []
    lines = text.splitlines()
    table_cells = ste._markdown_table_cells(lines)
    block = []
    in_quote = False
    after_boundary = True

    # Synonym / preferred pairs for rotation: preferred + avoid (preferred status)
    # Built once from vocabulary preferred concepts.
    synonym_groups = []
    try:
        data = yaml.safe_load(VOCAB_PATH.read_text(encoding="utf-8"))
        for term in data.get("terms") or []:
            if term.get("status") != "preferred":
                continue
            preferred = (term.get("preferred") or "").strip()
            if not preferred or preferred.startswith("<") or " / " in preferred:
                continue
            members = [preferred]
            for raw in term.get("avoid") or []:
                avoid = str(raw).strip()
                if not avoid or avoid in _SKIP_AVOID or "_" in avoid or " / " in avoid:
                    continue
                members.append(avoid)
            if len(members) > 1:
                synonym_groups.append(tuple(members))
    except OSError:
        synonym_groups = []

    seen_synonyms = {}

    def flush():
        findings.extend(_long_sentence_findings(block, filename))
        block.clear()

    for lineno, raw_line in enumerate(lines, 1):
        in_html = False
        if fence is None:
            in_html, html_block = ste._html_block_step(
                html_block, raw_line, in_paragraph
            )
        if in_html and ste._strip_quotes(raw_line.expandtabs(4))[0]:
            is_fence = False
        else:
            is_fence, fence = ste._fence_step(fence, raw_line)
        in_paragraph = bool(
            raw_line.strip()
            and not in_html
            and not is_fence
            and not fence
            and not ste.NO_PARAGRAPH.match(raw_line)
        )
        if is_fence:
            flush()
            after_boundary = ste._strip_quotes(raw_line)[0] == 0
            continue
        if fence:
            continue
        if ste.HTML_BLOCK_TAG.match(raw_line.lstrip()):
            for tag in ste.HTML_BLOCK_TAG.finditer(ste._mask_inline_code(raw_line)):
                name = tag.group(2).lower()
                if tag.group(1):
                    if name in html_containers:
                        while html_containers:
                            if html_containers.pop() == name:
                                break
                elif not tag.group().endswith("/>"):
                    html_containers.append(name)
        segments = table_cells.get(lineno - 1, [(raw_line, 0)])
        is_table = (lineno - 1) in table_cells
        quote = ste.BLOCKQUOTE_PREFIX.match(raw_line)
        is_quote = bool(quote)
        content = raw_line[quote.end():] if quote else raw_line
        alert = (
            not html_containers and raw_line.startswith(">") and after_boundary
            and is_quote and quote is not None and quote.group().count(">") == 1
            and ste.GITHUB_ALERT.fullmatch(content.strip())
        )
        standalone = ste.STANDALONE_LINE.match(content) or alert
        if (is_table or not content.strip() or standalone
                or ste.ANY_LIST_ITEM.match(content) or is_quote != in_quote):
            flush()
        in_quote = is_quote
        after_boundary = not raw_line.strip()
        for segment, source_column in segments:
            line = ste._mask_non_prose(segment)
            words_total += len(line.split())
            for rule_id, level, pattern, msg in RULES:
                for m in pattern.finditer(line):
                    findings.append({
                        "file": filename,
                        "line": lineno,
                        "col": source_column + m.start() + 1,
                        "rule": rule_id,
                        "level": level,
                        "match": m.group(0),
                        "message": msg,
                    })
            for _term, pattern, level, msg in VOCAB_AVOID:
                for m in pattern.finditer(line):
                    findings.append({
                        "file": filename,
                        "line": lineno,
                        "col": source_column + m.start() + 1,
                        "rule": "vocabulary-avoid",
                        "level": level,
                        "match": m.group(0),
                        "message": msg,
                    })
            for _phrase, pattern, level, msg in VOCAB_PHRASES:
                for m in pattern.finditer(line):
                    findings.append({
                        "file": filename,
                        "line": lineno,
                        "col": source_column + m.start() + 1,
                        "rule": "bad-phrase",
                        "level": level,
                        "match": m.group(0),
                        "message": msg,
                    })
            for gi, group in enumerate(synonym_groups):
                for base in group:
                    if (gi, base) in seen_synonyms:
                        continue
                    m = _flex_pattern(base).search(line)
                    if m:
                        seen_synonyms[(gi, base)] = (
                            lineno, source_column + m.start() + 1, m.group(0), base
                        )
            skip = quote.end() if quote and not is_table else 0
            marker = None if is_table else ste.ANY_LIST_ITEM.match(segment[skip:])
            if marker:
                skip += marker.end()
            if line[skip:].strip():
                block.append((lineno, source_column + skip, line[skip:]))
            if is_table:
                flush()
        if standalone:
            flush()
    flush()

    for gi, group in enumerate(synonym_groups):
        present = [
            seen_synonyms[(gi, b)]
            for b in group
            if (gi, b) in seen_synonyms
        ]
        if len(present) > 1:
            present.sort(key=lambda t: (t[0], t[1]))
            first_base = present[0][3]
            for lineno, col, match, base in present[1:]:
                findings.append({
                    "file": filename,
                    "line": lineno,
                    "col": col,
                    "rule": "synonym-rotation",
                    "level": "advisory-free",
                    "match": match,
                    "message": (
                        f"ESP-TS (ESTE-001): «{base}» y «{first_base}» nombran "
                        f"el mismo concepto. Elige uno y úsalo siempre."
                    ),
                })

    findings.extend(_dangling_conjunction_findings(text, filename))
    findings.sort(key=lambda f: (f["line"], f["col"]))
    return findings, words_total


def report(findings, words_total, as_json, hard_count, baseline):
    rate = round(len(findings) * 100 / words_total, 1) if words_total else 0.0
    if as_json:
        print(json.dumps({
            "violations": findings,
            "count": len(findings),
            "hard_count": hard_count,
            "baseline": baseline,
            "words": words_total,
            "per_100_words": rate,
            "linter": "esp-ts",
        }, indent=2, ensure_ascii=False))
        return
    for f in findings:
        print(
            f"{f['file']}:{f['line']}:{f['col']} {f['rule']}: "
            f"{f['message']} [{f['match']}]"
        )
    print(
        f"\n{len(findings)} violations ({hard_count} hard, baseline {baseline}), "
        f"{words_total} words, {rate} per 100 words"
    )
    print(
        "ESP-TS: modality hedges are never forced out; confidence stays content."
    )


def selftest():
    # false friend + vague verb + se impersonal + semicolon
    findings, _ = lint(
        "Se procede a realizar el deploy. El usuario actual falla; eventualmente."
    )
    rules = {f["rule"] for f in findings}
    assert "se-impersonal" in rules, findings
    assert "vague-realizar" in rules, findings
    assert "vocabulary-avoid" in rules or "bad-phrase" in rules, findings
    assert "semicolon" in rules, findings

    # bad phrase from vocabulary
    findings, _ = lint("Se configura el servicio de cara a mañana.")
    assert any(f["rule"] == "bad-phrase" for f in findings), findings

    # anglicism
    findings, _ = lint("Hay que deletear el archivo viejo.")
    assert any(
        f["rule"] == "vocabulary-avoid" and "deletear" in f["match"].lower()
        for f in findings
    ), findings

    # long sentence
    long = " ".join(f"palabra{n}" for n in range(1, 30)) + "."
    findings, _ = lint(long)
    assert any(f["rule"] == "long-sentence" for f in findings), findings

    # synonym rotation: preferred + avoid in same doc
    findings, _ = lint(
        "El operador inicia el servicio. Luego arranca el worker."
    )
    rot = [f for f in findings if f["rule"] == "synonym-rotation"]
    assert rot, findings

    # consistent preferred term: no rotation
    findings, _ = lint(
        "El operador inicia el servicio. Luego inicia el worker."
    )
    assert not any(f["rule"] == "synonym-rotation" for f in findings), findings

    # front matter skipped
    findings, words = lint(
        "---\ntitle: x\n---\nEl sistema es robusto.\n"
    )
    assert any(f["rule"] == "marketing-adjective" for f in findings), findings
    assert words == 4, words

    # inline code masked
    findings, _ = lint("Usa `deletear` en el script y luego elimina el resto.")
    assert not any(
        f["rule"] == "vocabulary-avoid" and "deletear" in f["match"].lower()
        for f in findings
    ), findings

    # dangling conjunction
    findings, _ = lint("- Completa el ítem y\n- Otro ítem")
    assert any(f["rule"] == "dangling-conjunction" for f in findings), findings

    # CLI smoke
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "a.md")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("Texto corto aquí.\n")
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            assert main([path, "--json"]) == 0
        payload = json.loads(out.getvalue())
        assert payload["linter"] == "esp-ts"
        assert payload["words"] == 3

    for bad in (["--basline", "3"], ["--baseline", "-1"], ["--disable", "nope"]):
        try:
            with contextlib.redirect_stderr(io.StringIO()):
                main(bad)
        except SystemExit as e:
            assert e.code == 2, (bad, e.code)
        else:
            raise AssertionError(bad)

    print("selftest OK")


RULE_IDS = {rule_id for rule_id, *_ in RULES} | {
    "long-sentence",
    "synonym-rotation",
    "dangling-conjunction",
    "vocabulary-avoid",
    "bad-phrase",
}


def _rule_list(value):
    rules = {r for r in value.split(",") if r}
    unknown = rules - RULE_IDS
    if unknown:
        raise argparse.ArgumentTypeError(
            f"unknown rule(s): {', '.join(sorted(unknown))}. "
            f"Known rules: {', '.join(sorted(RULE_IDS))}"
        )
    return rules


def _non_negative_int(value):
    try:
        n = int(value)
    except ValueError:
        n = -1
    if n < 0:
        raise argparse.ArgumentTypeError(
            f"expected a non-negative integer, got {value!r}"
        )
    return n


def main(argv):
    parser = argparse.ArgumentParser(
        prog="esp-ts-lint.py",
        allow_abbrev=False,
        description=(
            "Deterministic linter for ESP-TS (Español Técnico Simplificado). "
            "Reads stdin when no FILE is given. Lexical SSOT: vocabulary.yml."
        ),
    )
    parser.add_argument("paths", nargs="*", metavar="FILE")
    parser.add_argument("--json", action="store_true", help="print findings as JSON")
    parser.add_argument(
        "--baseline", type=_non_negative_int, default=0, metavar="N",
        help="pass unless hard violations exceed N (default 0)",
    )
    parser.add_argument(
        "--disable", type=_rule_list, action="append", default=[],
        metavar="RULES",
        help="comma-separated rule IDs to silence; may be repeated",
    )
    parser.add_argument(
        "--selftest", action="store_true", help="run the built-in tests",
    )
    args = parser.parse_intermixed_args(argv)
    if args.selftest:
        selftest()
        return 0
    as_json, baseline, paths = args.json, args.baseline, args.paths
    disabled = set().union(*args.disable)

    findings, words_total = [], 0
    if paths:
        for p in paths:
            try:
                with open(p, encoding="utf-8") as fh:
                    text = fh.read()
            except OSError as e:
                parser.error(f"cannot read {p}: {e.strerror}")
            f, w = lint(text, filename=p)
            findings.extend(f)
            words_total += w
    else:
        findings, words_total = lint(sys.stdin.read())

    findings = [f for f in findings if f["rule"] not in disabled]
    hard_count = sum(1 for f in findings if f["level"] == "advisory-free")
    report(findings, words_total, as_json, hard_count, baseline)
    return 1 if hard_count > baseline else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
