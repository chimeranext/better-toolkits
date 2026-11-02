#!/usr/bin/env python3
"""Incremental /opsx-living: append audit + changelog; refresh vista vigente only."""

from __future__ import annotations

import hashlib
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from opsx_living_standards import (  # noqa: E402  # pylint: disable=import-error  # pyright: ignore[reportMissingImports]
    ChangeAssessment,
    apply_verdicts_to_audit_row,
    assess_change,
    format_checker_details,
)

CHANGES_DIR = ROOT / "openspec" / "changes"
ARCHIVE_DIR = CHANGES_DIR / "archive"
CATALOG = ROOT / "openspec" / "feature-catalog.yaml"

MARKER_AUDIT_BEGIN = "<!-- opsx-living:audit-begin -->"
MARKER_AUDIT_END = "<!-- opsx-living:audit-end -->"
MARKER_VISTA_BEGIN = "<!-- opsx-living:vista-begin -->"
MARKER_VISTA_END = "<!-- opsx-living:vista-end -->"
MARKER_CHANGELOG_BEGIN = "<!-- opsx-living:changelog-begin -->"
MARKER_CHANGELOG_END = "<!-- opsx-living:changelog-end -->"

CHANGELOG_HEADING = re.compile(
    r"^### `(?P<change>[^`]+)` · `(?P<capability>[^`]+)`(?: · revisión (?P<revision>\d{4}-\d{2}-\d{2}))?\s*$",
    re.MULTILINE,
)
AUDIT_CHANGE_ID = re.compile(r"^\| `(?P<id>20\d{2}-\d{2}-\d{2}-[^`]+)` \|", re.MULTILINE)
AUDIT_SPEC_CAP = re.compile(r"\[([^\]]+)\]\([^)]*/specs/([^/)]+)/spec\.md\)")
EXIT_HITL_REQUIRED = 2
EXIT_CONFIG_ERROR = 1

ALLOWED_RESOLUTIONS = frozenset(
    {
        "append-revision",
        "patch-audit-links",
        "append-revision,patch-audit-links",
        "vista-only",
        "defer",
    }
)


class OpsxLivingError(Exception):
    """Base error for /opsx-living update script."""


class OpsxLivingConfigError(OpsxLivingError):
    """Invalid feature, catalog, or CLI flags."""


class OpsxLivingHitlRequired(OpsxLivingError):
    """Append-only rules blocked; human must pick a resolution."""

    def __init__(self, feature: str, conflicts: list[dict[str, str]]) -> None:
        assert_conflicts_shape(conflicts)
        self.feature = feature
        self.conflicts = conflicts
        super().__init__(f"HITL required for feature={feature} ({len(conflicts)} conflict(s))")


class OpsxLivingInvariantError(OpsxLivingError):
    """Generated living.md failed structural checks (script bug or corrupt source)."""


def assert_conflicts_shape(conflicts: list[dict[str, str]]) -> None:
    for conflict in conflicts:
        assert "kind" in conflict and conflict["kind"], "conflict missing kind"
        assert "message" in conflict and conflict["message"], "conflict missing message"
        assert "change_id" in conflict, "conflict missing change_id"


def assert_valid_resolution(resolution: str | None) -> None:
    if resolution is None:
        return
    if resolution not in ALLOWED_RESOLUTIONS:
        raise OpsxLivingConfigError(
            f"Unknown --resolution={resolution!r}. Allowed: {', '.join(sorted(ALLOWED_RESOLUTIONS))}"
        )


def assert_living_document(doc: str) -> None:
    """Fail fast before writing a broken living.md."""
    for marker in (
        MARKER_AUDIT_BEGIN,
        MARKER_AUDIT_END,
        MARKER_VISTA_BEGIN,
        MARKER_VISTA_END,
        MARKER_CHANGELOG_BEGIN,
        MARKER_CHANGELOG_END,
    ):
        count = doc.count(marker)
        assert count == 1, (
            f"falta o está duplicado un delimitador interno del living "
            f"(marcador {marker!r}; encontrados: {count})"
        )

    audit_start = doc.index(MARKER_AUDIT_BEGIN)
    audit_end = doc.index(MARKER_AUDIT_END)
    vista_start = doc.index(MARKER_VISTA_BEGIN)
    vista_end = doc.index(MARKER_VISTA_END)
    changelog_start = doc.index(MARKER_CHANGELOG_BEGIN)
    changelog_end = doc.index(MARKER_CHANGELOG_END)

    assert audit_start < audit_end < vista_start < vista_end < changelog_start < changelog_end, (
        "las Partes 1, 2 y 3 del living no quedaron en el orden esperado"
    )

    audit_body = doc[audit_start:audit_end]
    assert "## Parte 1" in audit_body, "falta el encabezado «Parte 1 — Registro de auditoría»"

    vista_body = doc[vista_start:vista_end]
    assert "## Parte 2" in vista_body, "falta el encabezado «Parte 2 — Requisitos aplicados»"

    changelog_body = doc[changelog_start:changelog_end]
    assert "## Parte 3" in changelog_body, "falta el encabezado «Parte 3 — Changelog de deltas»"

    dupes = duplicate_requirement_titles_in_vista(vista_body)
    assert not dupes, (
        "Parte 2 tiene títulos de requisito duplicados en la misma capability "
        "(el fold concatenó deltas): " + ", ".join(dupes)
    )


def duplicate_requirement_titles_in_vista(vista_body: str) -> list[str]:
    """Same title twice in one capability is a fold bug; reuse across capabilities is OK."""
    dupes: list[str] = []
    for section in re.split(r"(?=^### Capability )", vista_body, flags=re.MULTILINE):
        titles = re.findall(r"^### Requirement: (.+)$", section, flags=re.MULTILINE)
        if not titles:
            continue
        seen = {title for title in titles if titles.count(title) > 1}
        dupes.extend(f"{title}" for title in sorted(seen))
    return dupes


SECTION_HEADER = re.compile(
    r"^## (ADDED|MODIFIED|REMOVED|RENAMED) Requirements\s*$",
    re.MULTILINE,
)
# Official OpenSpec format is `- FROM: `### Requirement: Title``; the bare title is also accepted.
RENAME_FROM = re.compile(r"^-\s+FROM:\s+`(?:###\s*Requirement:\s*)?([^`]+)`\s*$", re.MULTILINE)
RENAME_TO = re.compile(r"^-\s+TO:\s+`(?:###\s*Requirement:\s*)?([^`]+)`\s*$", re.MULTILINE)


def load_capabilities(feature: str) -> list[str]:
    text = CATALOG.read_text(encoding="utf-8")
    block_match = re.search(
        rf"^\s{{2}}{feature}:\s*\n(.*?)(?=^\s{{2}}\w|\Z)",
        text,
        re.MULTILINE | re.DOTALL,
    )
    if not block_match:
        raise OpsxLivingConfigError(f"Feature '{feature}' not found in {CATALOG}")
    block = block_match.group(1)
    caps: list[str] = []
    in_caps = False
    for line in block.splitlines():
        if re.match(r"^\s+capabilities:\s*$", line):
            in_caps = True
            continue
        if in_caps and re.match(
            r"^\s+(excluded:|exclude_change_id_substrings:|include_change_id_substrings:|vista_drop_titles:|vista_drop_scenarios:)",
            line,
        ):
            break
        if in_caps:
            m = re.match(r"^\s+-\s+(\S+)\s*$", line)
            if m:
                caps.append(m.group(1))
    if not caps:
        raise OpsxLivingConfigError(f"No capabilities listed for feature '{feature}'")
    return caps


def load_vista_drop_titles(feature: str) -> list[str]:
    """Titles to drop from Parte 2 after the OpenSpec fold (catalog override)."""
    text = CATALOG.read_text(encoding="utf-8")
    block_match = re.search(
        rf"^\s{{2}}{feature}:\s*\n(.*?)(?=^\s{{2}}\w|\Z)",
        text,
        re.MULTILINE | re.DOTALL,
    )
    if not block_match:
        return []
    titles: list[str] = []
    in_drops = False
    for line in block_match.group(1).splitlines():
        if re.match(r"^\s+vista_drop_titles:\s*$", line):
            in_drops = True
            continue
        if in_drops and re.match(r"^\s+\w", line) and not line.lstrip().startswith("-"):
            break
        if in_drops:
            m = re.match(r"^\s+-\s+(.+?)\s*$", line)
            if m:
                titles.append(m.group(1).strip().strip("'\""))
    return titles


def load_exclude_change_id_substrings(feature: str) -> list[str]:
    """Substrings that skip a change id when discovering deltas for this feature."""
    return _load_change_id_substrings(feature, "exclude_change_id_substrings")


def load_vista_drop_scenarios(feature: str) -> dict[str, set[str]]:
    """`Requirement title » Scenario title` entries to drop from Parte 2 only."""
    drops: dict[str, set[str]] = {}
    for entry in _load_catalog_list(feature, "vista_drop_scenarios", lower=False):
        title, sep, scenario = entry.partition(" » ")
        assert sep, f"vista_drop_scenarios entry needs ' » ': {entry}"
        drops.setdefault(title.strip(), set()).add(scenario.strip())
    return drops


def drop_scenarios_from_block(block: str, scenarios: set[str]) -> str:
    """Remove `#### Scenario: <name>` sections (up to the next `####`) from a requirement block."""
    parts = re.split(r"(?=^#### )", block, flags=re.MULTILINE)
    kept = [
        part
        for part in parts
        if not any(part.startswith(f"#### Scenario: {name}") for name in scenarios)
    ]
    return "".join(kept).rstrip()


def load_include_change_id_substrings(feature: str) -> list[str]:
    """If set, only change ids containing one of these substrings are folded."""
    return _load_change_id_substrings(feature, "include_change_id_substrings")


def _load_change_id_substrings(feature: str, key: str) -> list[str]:
    return _load_catalog_list(feature, key, lower=True)


def _load_catalog_list(feature: str, key: str, lower: bool) -> list[str]:
    text = CATALOG.read_text(encoding="utf-8")
    block_match = re.search(
        rf"^\s{{2}}{feature}:\s*\n(.*?)(?=^\s{{2}}\w|\Z)",
        text,
        re.MULTILINE | re.DOTALL,
    )
    if not block_match:
        return []
    needles: list[str] = []
    in_list = False
    for line in block_match.group(1).splitlines():
        if re.match(rf"^\s+{key}:\s*$", line):
            in_list = True
            continue
        if in_list and re.match(r"^\s+\w", line) and not line.lstrip().startswith("-"):
            break
        if in_list:
            m = re.match(r"^\s+-\s+(.+?)\s*$", line)
            if m:
                value = m.group(1).strip().strip("'\"")
                needles.append(value.lower() if lower else value)
    return needles


def git_intro_commit(change_id: str) -> str:
    for rel in (
        f"openspec/changes/{change_id}",
        f"openspec/changes/archive/{change_id}",
    ):
        proc = subprocess.run(
            [
                "git",
                "log",
                "origin/main",
                "--diff-filter=A",
                "-1",
                "--format=%h",
                "--",
                rel,
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        h = (proc.stdout or "").strip()
        if h:
            return h
    return "?"


def change_date(change_id: str) -> str:
    m = re.match(r"^(20\d{2}-\d{2}-\d{2})-", change_id)
    return m.group(1) if m else "?"


def iter_change_dirs() -> list[Path]:
    dirs: list[Path] = []
    for base in (CHANGES_DIR, ARCHIVE_DIR):
        if not base.is_dir():
            continue
        for child in sorted(base.iterdir()):
            if child.is_dir() and child.name != "archive":
                dirs.append(child)
    return dirs


def discover_records(
    capabilities: list[str],
    exclude_change_id_substrings: list[str] | None = None,
    include_change_id_substrings: list[str] | None = None,
) -> list[dict[str, str]]:
    needles = [n.lower() for n in (exclude_change_id_substrings or []) if n]
    keep = [n.lower() for n in (include_change_id_substrings or []) if n]
    records: list[dict[str, str]] = []
    for change_dir in iter_change_dirs():
        change_id = change_dir.name
        if needles and any(n in change_id.lower() for n in needles):
            continue
        if keep and not any(n in change_id.lower() for n in keep):
            continue
        for cap in capabilities:
            delta = change_dir / "specs" / cap / "spec.md"
            if not delta.is_file():
                continue
            records.append(
                {
                    "id": change_id,
                    "date": change_date(change_id),
                    "commit": git_intro_commit(change_id),
                    "capability": cap,
                }
            )
    records.sort(key=lambda r: (r["date"], r["id"], r["capability"]))
    return records


def split_requirements(body: str) -> list[tuple[str, str]]:
    parts = re.split(r"(?=^### Requirement:)", body, flags=re.MULTILINE)
    reqs: list[tuple[str, str]] = []
    for part in parts:
        part = part.strip()
        if not part.startswith("### Requirement:"):
            continue
        title = part.split("\n", 1)[0].replace("### Requirement:", "").strip()
        reqs.append((title, part))
    return reqs


def delta_body(raw: str) -> str:
    for header in (
        "## ADDED Requirements",
        "## MODIFIED Requirements",
        "## REMOVED Requirements",
        "## RENAMED Requirements",
    ):
        if header in raw:
            return raw.split(header, 1)[1].strip()
    return raw.strip()


def load_delta(change_id: str, capability: str) -> str:
    for base in (CHANGES_DIR, ARCHIVE_DIR):
        path = base / change_id / "specs" / capability / "spec.md"
        if path.is_file():
            return delta_body(path.read_text(encoding="utf-8"))
    return ""


def parse_delta_operations(raw: str) -> list[dict[str, str]]:
    """Parse OpenSpec delta sections into ordered operations (never concatenate)."""
    ops: list[dict[str, str]] = []
    matches = list(SECTION_HEADER.finditer(raw))
    if not matches:
        for title, block in split_requirements(raw):
            ops.append({"op": "added", "title": title, "block": block})
        return ops
    for idx, match in enumerate(matches):
        kind = match.group(1).lower()
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(raw)
        body = raw[start:end]
        if kind == "renamed":
            froms = RENAME_FROM.findall(body)
            tos = RENAME_TO.findall(body)
            for src, dest in zip(froms, tos, strict=False):
                ops.append({"op": "renamed", "from": src, "to": dest})
            continue
        for title, block in split_requirements(body):
            ops.append({"op": kind, "title": title, "block": block})
    return ops


def fold_operations(
    batches: list[tuple[str, str, list[dict[str, str]]]],
    drop_titles: set[str] | None = None,
) -> tuple[list[tuple[str, str]], dict[str, tuple[str, str, str]]]:
    """Apply ADDED/MODIFIED/REMOVED/RENAMED oldest-first. One title = one block."""
    store: dict[str, str] = {}
    order: list[str] = []
    provenance: dict[str, tuple[str, str, str]] = {}

    def _set(title: str, block: str, kind: str, change_id: str, commit: str) -> None:
        if title not in store:
            order.append(title)
        store[title] = block
        provenance[title] = (kind, change_id, commit)

    def _drop(title: str) -> None:
        if title in store:
            del store[title]
        if title in provenance:
            del provenance[title]
        if title in order:
            order.remove(title)

    for change_id, commit, ops in batches:
        for op in ops:
            kind = op["op"]
            if kind == "added":
                title = op["title"]
                fold_kind = "supersedes" if title in store else "added"
                _set(title, op["block"], fold_kind, change_id, commit)
            elif kind == "modified":
                _set(op["title"], op["block"], "supersedes", change_id, commit)
            elif kind == "removed":
                _drop(op["title"])
            elif kind == "renamed":
                src, dest = op["from"], op["to"]
                block = store.get(src, store.get(dest, f"### Requirement: {dest}\n"))
                if not block.startswith("### Requirement:"):
                    block = f"### Requirement: {dest}\n\n{block}"
                else:
                    first, _, rest = block.partition("\n")
                    block = f"### Requirement: {dest}\n{rest}"
                _drop(src)
                _set(dest, block.strip(), "supersedes", change_id, commit)
    for title in drop_titles or set():
        _drop(title)
    merged = [(title, store[title]) for title in order if title in store]
    return merged, provenance


def fold_capability(
    capability: str,
    records: list[dict[str, str]],
    drop_titles: set[str] | None = None,
) -> tuple[list[tuple[str, str]], dict[str, tuple[str, str, str]]]:
    """Return ordered (title, block) after an OpenSpec fold — never concatenated deltas."""
    batches: list[tuple[str, str, list[dict[str, str]]]] = []
    for rec in records:
        if rec["capability"] != capability:
            continue
        raw_path = CHANGES_DIR / rec["id"] / "specs" / capability / "spec.md"
        if not raw_path.is_file():
            raw_path = ARCHIVE_DIR / rec["id"] / "specs" / capability / "spec.md"
        if not raw_path.is_file():
            continue
        raw = raw_path.read_text(encoding="utf-8")
        batches.append((rec["id"], rec["commit"], parse_delta_operations(raw)))
    return fold_operations(batches, drop_titles=drop_titles)


def procedencia_line(kind: str, change_id: str, when: str, commit: str) -> str:
    return f"> **Procedencia:** {kind} · `{change_id}` · {when} · `{commit}`"


def attach_procedencia(block: str, line: str) -> str:
    """Put the Procedencia callout immediately under ### Requirement:, not before it.

    A blockquote *before* ``### Requirement:`` belongs to the previous heading in Markdown
    (GitHub / VitePress), which made Procedencia look like a footer of the prior requirement.
    """
    lines = block.splitlines()
    if not lines:
        return line
    heading = lines[0]
    rest_lines = lines[1:]
    while rest_lines and not rest_lines[0].strip():
        rest_lines.pop(0)
    if rest_lines and rest_lines[0].startswith("> **Procedencia:**"):
        rest_lines.pop(0)
        while rest_lines and not rest_lines[0].strip():
            rest_lines.pop(0)
    rest = "\n".join(rest_lines)
    if rest:
        return f"{heading}\n\n{line}\n\n{rest}"
    return f"{heading}\n\n{line}\n"


def group_records_by_change(records: list[dict[str, str]]) -> list[tuple[str, list[dict[str, str]]]]:
    """One audit row per change; each row may reference several capability deltas."""
    by_id: dict[str, list[dict[str, str]]] = {}
    for rec in records:
        by_id.setdefault(rec["id"], []).append(rec)
    ordered = sorted(by_id.items(), key=lambda item: (change_date(item[0]), item[0]))
    return ordered


def audit_table_rows(records: list[dict[str, str]]) -> list[str]:
    rows: list[str] = []
    for change_id, group in group_records_by_change(records):
        c = group[0]
        base = f"../../changes/{change_id}"
        if not (CHANGES_DIR / change_id).is_dir():
            base = f"../../changes/archive/{change_id}"
        proposal = f"[proposal]({base}/proposal.md)"
        design_path = (CHANGES_DIR / change_id / "design.md") if (CHANGES_DIR / change_id).exists() else (
            ARCHIVE_DIR / change_id / "design.md"
        )
        design = f"[design]({base}/design.md)" if design_path.is_file() else "—"
        spec_parts = [
            f"[{rec['capability']}]({base}/specs/{rec['capability']}/spec.md)"
            for rec in sorted(group, key=lambda r: r["capability"])
        ]
        spec = ", ".join(spec_parts) if spec_parts else "—"
        tasks = f"[tasks]({base}/tasks.md)"
        caps = [rec["capability"] for rec in group]
        iso, ieee, risk = assess_change(change_id, caps).cells()
        rows.append(
            f"| `{change_id}` | {c['date']} | `{c['commit']}` | {proposal} | {design} | {spec} | {tasks} | {iso} | {ieee} | {risk} |"
        )
    return rows


def assess_records(records: list[dict[str, str]]) -> list[ChangeAssessment]:
    assessments: list[ChangeAssessment] = []
    for change_id, group in group_records_by_change(records):
        caps = [rec["capability"] for rec in group]
        assessments.append(assess_change(change_id, caps))
    return assessments


def refresh_audit_standard_cells(row: str, records: list[dict[str, str]]) -> str:
    match = re.match(r"^\| `(?P<id>[^`]+)` \|", row)
    if not match:
        return row
    change_id = match.group("id")
    caps = [rec["capability"] for rec in records if rec["id"] == change_id]
    return apply_verdicts_to_audit_row(row, assess_change(change_id, caps).cells())


def parse_audit_ids(text: str) -> set[str]:
    return {m.group("id") for m in AUDIT_CHANGE_ID.finditer(text)}


def parse_changelog_keys(text: str) -> set[tuple[str, str]]:
    """Primary (change, capability) pairs — revision headings count as the same pair."""
    return {(m.group("change"), m.group("capability")) for m in CHANGELOG_HEADING.finditer(text)}


def normalize_for_hash(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def content_hash(text: str) -> str:
    return hashlib.sha256(normalize_for_hash(text).encode("utf-8")).hexdigest()[:16]


def changelog_block_sections(text: str) -> list[tuple[str, str, str, str]]:
    """Return (change_id, capability, revision_date|'', body) per heading block."""
    sections: list[tuple[str, str, str, str]] = []
    matches = list(CHANGELOG_HEADING.finditer(text))
    for idx, m in enumerate(matches):
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        revision = m.group("revision") or ""
        sections.append((m.group("change"), m.group("capability"), revision, body))
    return sections


def strip_changelog_metadata(body: str) -> str:
    lines: list[str] = []
    for line in body.splitlines():
        if line.startswith("> **Registrado en living:**"):
            continue
        if line.startswith("> **Procedencia:**"):
            continue
        if line.startswith("> **HITL:**"):
            continue
        lines.append(line)
    return "\n".join(lines).strip()


def latest_recorded_delta_hash(changelog_text: str, change_id: str, capability: str) -> str | None:
    blocks = [
        (rev, body)
        for cid, cap, rev, body in changelog_block_sections(changelog_text)
        if cid == change_id and cap == capability
    ]
    if not blocks:
        return None
    blocks.sort(key=lambda item: item[0] or "")
    _, body = blocks[-1]
    return content_hash(strip_changelog_metadata(body))


def audit_row_for_change(audit_text: str, change_id: str) -> str | None:
    for line in audit_text.splitlines():
        if line.startswith(f"| `{change_id}` |"):
            return line
    return None


def capabilities_linked_in_audit_row(row: str) -> set[str]:
    return {m.group(2) for m in AUDIT_SPEC_CAP.finditer(row)}


def discover_capabilities_by_change(records: list[dict[str, str]]) -> dict[str, set[str]]:
    out: dict[str, set[str]] = {}
    for rec in records:
        out.setdefault(rec["id"], set()).add(rec["capability"])
    return out


def detect_hitl_conflicts(
    existing_audit: str,
    existing_changelog: str,
    records: list[dict[str, str]],
) -> list[dict[str, str]]:
    conflicts: list[dict[str, str]] = []
    caps_by_change = discover_capabilities_by_change(records)

    for change_id, caps in caps_by_change.items():
        row = audit_row_for_change(existing_audit, change_id)
        if row is None:
            continue
        linked = capabilities_linked_in_audit_row(row)
        missing = caps - linked
        if missing:
            conflicts.append(
                {
                    "kind": "audit_spec_links_gap",
                    "change_id": change_id,
                    "capabilities": ", ".join(sorted(missing)),
                    "message": (
                        f"Change `{change_id}` ya está en Parte 1 pero faltan enlaces Spec delta "
                        f"para: {', '.join(sorted(missing))}. No encaja en append de fila nueva."
                    ),
                }
            )

    for change_id, capability in parse_changelog_keys(existing_changelog):
        on_disk = load_delta(change_id, capability)
        if not on_disk.strip():
            conflicts.append(
                {
                    "kind": "delta_removed",
                    "change_id": change_id,
                    "capability": capability,
                    "message": (
                        f"Parte 3 registra `{change_id}` · `{capability}` pero el delta ya no está en changes/."
                    ),
                }
            )
            continue
        recorded_hash = latest_recorded_delta_hash(existing_changelog, change_id, capability)
        if recorded_hash is None:
            continue
        disk_hash = content_hash(on_disk)
        if disk_hash != recorded_hash:
            conflicts.append(
                {
                    "kind": "delta_revised",
                    "change_id": change_id,
                    "capability": capability,
                    "recorded_hash": recorded_hash,
                    "disk_hash": disk_hash,
                    "message": (
                        f"El delta `{change_id}` · `{capability}` cambió en disco respecto al último "
                        f"bloque en Parte 3 ({recorded_hash} → {disk_hash}). Append del bloque original "
                        f"no aplica; hace falta criterio HITL."
                    ),
                }
            )

    return conflicts


def print_hitl_report(feature: str, conflicts: list[dict[str, str]]) -> None:
    print(f"OPSX_LIVING_HITL_REQUIRED feature={feature}", file=sys.stderr)
    print("", file=sys.stderr)
    print("La corrida se detuvo antes de escribir living.md.", file=sys.stderr)
    print("Resuelve con criterio humano y vuelve a correr con un flag de resolución.", file=sys.stderr)
    print("", file=sys.stderr)
    for idx, c in enumerate(conflicts, 1):
        print(f"{idx}. [{c['kind']}] {c['message']}", file=sys.stderr)
    print("", file=sys.stderr)
    print("Opciones (elige en chat; el agente pasa el flag correspondiente):", file=sys.stderr)
    print(
        "  --resolution append-revision   Añade bloques `· revisión YYYY-MM-DD` en Parte 3 "
        "(histórico conservado) y actualiza Parte 2.",
        file=sys.stderr,
    )
    print(
        "  --resolution vista-only        Solo regenera Parte 2; Parte 1/3 sin cambios "
        "(aceptas divergencia temporal changelog ↔ vista).",
        file=sys.stderr,
    )
    print(
        "  --resolution defer             No escribir; corrige el change o living manualmente.",
        file=sys.stderr,
    )
    print(
        "  --resolution patch-audit-links Solo para audit_spec_links_gap: reescribe la fila "
        "de auditoría de ese change con todos los enlaces Spec (única excepción in-place en Parte 1).",
        file=sys.stderr,
    )


def extract_between(text: str, begin: str, end: str) -> str:
    if begin not in text or end not in text:
        return ""
    return text.split(begin, 1)[1].split(end, 1)[0]


def build_audit_section(existing_audit: str, all_records: list[dict[str, str]]) -> str:
    lines = [
        "## Parte 1 — Registro de auditoría",
        "",
        "Tabla **append-only**: cada corrida añade filas para changes nuevos; **no se quitan** filas pasadas (como un changelog).",
        "",
        "| Change | Fecha | Commit en `main` | Proposal | Design | Spec delta | Tasks | ISO 29148 | IEEE 29119-3 | ISO 31000 |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    # Preserve existing rows in order, then append new. ISO cells are recomputed each run.
    if existing_audit:
        for line in existing_audit.splitlines():
            if line.startswith("| `20"):
                lines.append(refresh_audit_standard_cells(line, all_records))
    seen_ids = parse_audit_ids("\n".join(lines))
    for row in audit_table_rows(all_records):
        m = re.match(r"^\| `(?P<id>[^`]+)` \|", row)
        if m and m.group("id") not in seen_ids:
            lines.append(row)
            seen_ids.add(m.group("id"))
    lines.append("")
    lines.append(
        "Normas: **ISO/IEC/IEEE 29148:2018**, **IEEE 29119-3**, **ISO 31000:2018** — "
        "celdas `pass` / `partial` / `fail` / `not-assessed` según `scripts/opsx_living_standards.py` "
        "(recalculadas cada corrida)."
    )
    lines.append("")
    lines.append(format_checker_details(assess_records(all_records)))
    return "\n".join(lines)


def build_vista_section(
    capabilities: list[str],
    records: list[dict[str, str]],
    drop_titles: set[str] | None = None,
    drop_scenarios: dict[str, set[str]] | None = None,
) -> str:
    lines = [
        "## Parte 2 — Requisitos aplicados (vista vigente)",
        "",
        "Se **regenera** en cada corrida. Fold OpenSpec (ADDED / MODIFIED / REMOVED / RENAMED; "
        "un título = un requisito). El historial por delta está en la Parte 3 (append-only).",
        "",
    ]
    for cap in capabilities:
        merged, prov = fold_capability(cap, records, drop_titles=drop_titles)
        if not merged:
            continue
        lines.append(f"### Capability `{cap}`")
        lines.append("")
        lines.append("**Deltas de origen (solo lectura):** Parte 1 y Parte 3.")
        lines.append("")
        lines.append("## Requirements")
        lines.append("")
        for title, block in merged:
            if drop_scenarios and title in drop_scenarios:
                block = drop_scenarios_from_block(block, drop_scenarios[title])
            kind, cid, commit = prov.get(title, ("added", "?", "?"))
            when = change_date(cid) if cid != "?" else "?"
            lines.append(attach_procedencia(block, procedencia_line(kind, cid, when, commit)))
            lines.append("")
    return "\n".join(lines)


def changelog_revision_block(rec: dict[str, str], run_date: str, hitl_note: str) -> str:
    body = load_delta(rec["id"], rec["capability"])
    if not body.strip():
        return ""
    kind = "added"
    raw_path = CHANGES_DIR / rec["id"] / "specs" / rec["capability"] / "spec.md"
    if not raw_path.is_file():
        raw_path = ARCHIVE_DIR / rec["id"] / "specs" / rec["capability"] / "spec.md"
    if raw_path.is_file():
        raw = raw_path.read_text(encoding="utf-8")
        if "## MODIFIED Requirements" in raw:
            kind = "supersedes"
    lines = [
        f"### `{rec['id']}` · `{rec['capability']}` · revisión {run_date}",
        "",
        f"> **Registrado en living:** {run_date} (`/opsx-living`)",
        f"> **HITL:** {hitl_note}",
        procedencia_line(kind, rec["id"], rec["date"], rec["commit"]),
        "",
        body,
        "",
    ]
    return "\n".join(lines)


def changelog_block(rec: dict[str, str], run_date: str) -> str:
    body = load_delta(rec["id"], rec["capability"])
    if not body.strip():
        return ""
    kind = "added"
    raw_path = CHANGES_DIR / rec["id"] / "specs" / rec["capability"] / "spec.md"
    if not raw_path.is_file():
        raw_path = ARCHIVE_DIR / rec["id"] / "specs" / rec["capability"] / "spec.md"
    if raw_path.is_file():
        raw = raw_path.read_text(encoding="utf-8")
        if "## MODIFIED Requirements" in raw:
            kind = "supersedes"
    lines = [
        f"### `{rec['id']}` · `{rec['capability']}`",
        "",
        f"> **Registrado en living:** {run_date} (`/opsx-living`)",
        procedencia_line(kind, rec["id"], rec["date"], rec["commit"]),
        "",
        body,
        "",
    ]
    return "\n".join(lines)


def refresh_audit_spec_links(
    existing_audit: str,
    records: list[dict[str, str]],
    change_ids: set[str],
) -> str:
    fresh_map: dict[str, str] = {}
    for row in audit_table_rows(records):
        m = re.match(r"^\| `(?P<id>[^`]+)` \|", row)
        if m:
            fresh_map[m.group("id")] = row
    lines: list[str] = []
    for line in existing_audit.splitlines():
        if line.startswith("| `20"):
            m = re.match(r"^\| `(?P<id>[^`]+)` \|", line)
            if m and m.group("id") in change_ids and m.group("id") in fresh_map:
                lines.append(fresh_map[m.group("id")])
                continue
        lines.append(line)
    return "\n".join(lines)


def build_changelog_section(
    existing_changelog: str,
    records: list[dict[str, str]],
    run_date: str,
    revision_keys: set[tuple[str, str]] | None = None,
) -> str:
    known = parse_changelog_keys(existing_changelog)
    lines = [
        "## Parte 3 — Changelog de deltas (append-only)",
        "",
        "Cada corrida **añade** bloques `### \\`change\\` · \\`capability\\`` para pares nuevos. "
        "No se eliminan entradas anteriores (historial de QA / auditoría).",
        "",
    ]
    if existing_changelog.strip():
        # Keep body after heading, strip duplicate heading if present
        body = existing_changelog
        if "## Parte 3" in body:
            body = body.split("## Parte 3", 1)[1]
            body = re.sub(r"^[^\n]*\n+", "", body, count=1)
            body = re.sub(
                r"^Cada corrida \*\*añade\*\*.*?\n\n",
                "",
                body,
                count=1,
                flags=re.DOTALL,
            )
        lines.append(body.rstrip())
        lines.append("")
    revision_keys = revision_keys or set()
    for rec in records:
        key = (rec["id"], rec["capability"])
        if key in revision_keys:
            block = changelog_revision_block(
                rec,
                run_date,
                "append-revision — delta en disco distinto al último bloque en Parte 3",
            )
            if block:
                lines.append(block)
            continue
        if key in known:
            continue
        block = changelog_block(rec, run_date)
        if block:
            lines.append(block)
            known.add(key)
    lines.append("")
    return "\n".join(lines)


def build_header(feature: str, run_date: str) -> str:
    title = feature.replace("-", " ").title()
    return f"""# {title} — living spec

Documento vivo del feature **{title}**. Generado y ampliado por `/opsx-living {feature}`. Catálogo: [`feature-catalog.yaml`](../../feature-catalog.yaml).

**Última corrida `/opsx-living`:** {run_date}

| Qué | Dónde |
| --- | --- |
| Índice del feature | [`{feature}.md`](../{feature}.md) |
| Deltas en `openspec/changes/` (no se editan) | Parte 1 + Parte 3 |
| Vista vigente para QA | Parte 2 (se refresca cada corrida) |

"""


def parse_resolution(argv: list[str]) -> str | None:
    for arg in argv:
        if arg.startswith("--resolution="):
            return arg.split("=", 1)[1].strip()
    return None


def unresolved_after_resolution(
    conflicts: list[dict[str, str]],
    resolution: str | None,
) -> list[dict[str, str]]:
    if resolution is None:
        return conflicts
    if resolution == "defer":
        return conflicts
    if resolution == "vista-only":
        return []
    remaining: list[dict[str, str]] = []
    for c in conflicts:
        kind = c["kind"]
        if resolution == "append-revision" and kind == "delta_revised":
            continue
        if resolution == "patch-audit-links" and kind == "audit_spec_links_gap":
            continue
        if resolution == "append-revision,patch-audit-links":
            if kind in ("delta_revised", "audit_spec_links_gap"):
                continue
        remaining.append(c)
    return remaining


def update_living(feature: str, resolution: str | None = None) -> Path:
    assert feature.strip(), "feature key must be non-empty"
    assert_valid_resolution(resolution)

    capabilities = load_capabilities(feature)
    assert capabilities, "load_capabilities must return at least one capability"
    drop_titles = set(load_vista_drop_titles(feature))
    drop_scenarios = load_vista_drop_scenarios(feature)
    exclude_substrings = load_exclude_change_id_substrings(feature)
    include_substrings = load_include_change_id_substrings(feature)
    out = ROOT / "openspec" / "features" / feature / "living.md"
    run_date = date.today().isoformat()
    records = discover_records(
        capabilities,
        exclude_change_id_substrings=exclude_substrings,
        include_change_id_substrings=include_substrings,
    )

    existing = out.read_text(encoding="utf-8") if out.is_file() else ""
    existing_audit = extract_between(existing, MARKER_AUDIT_BEGIN, MARKER_AUDIT_END)
    existing_changelog = extract_between(existing, MARKER_CHANGELOG_BEGIN, MARKER_CHANGELOG_END)

    if not existing_audit and "## Parte 1" in existing:
        existing_audit = existing.split("## Parte 1", 1)[1]
        if "## Parte 2" in existing_audit:
            existing_audit = existing_audit.split("## Parte 2", 1)[0]

    if not existing_changelog and "## Parte 3" not in existing and records:
        existing_changelog = ""

    conflicts = detect_hitl_conflicts(existing_audit, existing_changelog, records)
    remaining = unresolved_after_resolution(conflicts, resolution)
    if remaining:
        raise OpsxLivingHitlRequired(feature, remaining)

    if conflicts and resolution == "defer":
        raise OpsxLivingHitlRequired(feature, conflicts)

    revision_keys: set[tuple[str, str]] = set()
    if resolution and "append-revision" in resolution:
        revision_keys = {
            (c["change_id"], c["capability"])
            for c in conflicts
            if c["kind"] == "delta_revised"
        }

    audit_source = existing_audit
    if resolution and "patch-audit-links" in resolution:
        patch_ids = {c["change_id"] for c in conflicts if c["kind"] == "audit_spec_links_gap"}
        audit_source = refresh_audit_spec_links(audit_source, records, patch_ids)

    vista = build_vista_section(
        capabilities,
        records,
        drop_titles=drop_titles,
        drop_scenarios=drop_scenarios,
    )

    if resolution == "vista-only" and conflicts:
        audit = extract_between(existing, MARKER_AUDIT_BEGIN, MARKER_AUDIT_END).strip()
        changelog = extract_between(existing, MARKER_CHANGELOG_BEGIN, MARKER_CHANGELOG_END).strip()
        if not audit:
            audit = build_audit_section(audit_source, records)
        if not changelog:
            changelog = build_changelog_section(existing_changelog, records, run_date)
    else:
        audit = build_audit_section(audit_source, records)
        changelog = build_changelog_section(
            existing_changelog,
            records,
            run_date,
            revision_keys=revision_keys,
        )

    doc = (
        build_header(feature, run_date)
        + MARKER_AUDIT_BEGIN
        + "\n"
        + audit
        + MARKER_AUDIT_END
        + "\n\n"
        + MARKER_VISTA_BEGIN
        + "\n"
        + vista
        + MARKER_VISTA_END
        + "\n\n"
        + MARKER_CHANGELOG_BEGIN
        + "\n"
        + changelog
        + MARKER_CHANGELOG_END
        + "\n"
    )
    try:
        assert_living_document(doc)
    except AssertionError as exc:
        raise OpsxLivingInvariantError(str(exc)) from exc

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")
    return out


def main() -> None:
    argv = sys.argv[1:]
    feature = "home"
    positional: list[str] = []
    for arg in argv:
        if arg.startswith("--"):
            continue
        positional.append(arg)
    if positional:
        feature = positional[0]
    resolution = parse_resolution(argv)
    try:
        path = update_living(feature, resolution=resolution)
    except OpsxLivingHitlRequired as exc:
        print_hitl_report(exc.feature, exc.conflicts)
        raise SystemExit(EXIT_HITL_REQUIRED) from exc
    except OpsxLivingConfigError as exc:
        print(f"opsx-living-update: {exc}", file=sys.stderr)
        raise SystemExit(EXIT_CONFIG_ERROR) from exc
    except OpsxLivingInvariantError as exc:
        print(
            "opsx-living-update: no se guardó living.md porque el borrador generado "
            "no tiene la estructura correcta (Partes 1–3 y delimitadores internos). "
            "Si persiste, report this to the maintainers channel of the toolkit with this detail:",
            file=sys.stderr,
        )
        print(f"  {exc}", file=sys.stderr)
        raise SystemExit(EXIT_CONFIG_ERROR) from exc

    print(f"Updated {path} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
