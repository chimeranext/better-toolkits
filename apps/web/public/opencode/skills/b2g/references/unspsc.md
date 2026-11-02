# UNSPSC classification (B2G)

UNSPSC (United Nations Standard Products and Services Code) is the standard
classification used across public-procurement platforms. Codes are 8 digits
(4 segments: segment, family, class, commodity).

## Why it matters

- Public tenders carry UNSPSC codes (or text that maps to them).
- The client's catalog must be translated to UNSPSC to match tenders.
- Tenders and catalogs use mixed ES/EN terminology → a **synonym dictionary** is
  required (the same pattern as LicitaNext/hunter-core).

## Use

`unspsc_map.py --catalog catalog.json --synonyms synonyms.json` maps catalog items to
UNSPSC codes. `tender_match.py` then intersects those codes with tender codes.
