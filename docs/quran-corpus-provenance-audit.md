# Quran corpus provenance and offline audit plan

## Scope and immutable safeguards
- Exactly 114 surahs and 6,236 ayahs in the project's chosen Hafs numbering convention; no verse text changes.
- Compare primary Arabic `quran-uthmani` against an independently acquired, edition-compatible reference. Do not normalize away diacritics, orthographic signs, Basmalah or Unicode differences.
- Verify Malay `ms.basmeih` independently against reviewed edition metadata; matching IDs does not certify translation correctness.
- Keep external source files outside the application until license, publisher, edition/version and integrity review are complete.

## Evidence manifest (required for each source)
Record role, canonical HTTPS origin, publisher, edition identifier, version/revision, retrievedAt ISO timestamp, byte-level SHA-256, file size, license text/URL and redistribution permissions, and acquisition method. The current structural validator checks a subset only; human review is mandatory for authenticity and licensing. Do not assert an unverified license.

## Deterministic offline validation
1. Hash raw bytes before JSON parsing; preserve original files unchanged.
2. Require surahs numbered 1–114, canonical per-surah counts, global verse numbers 1–6236 and local numbering.
3. Compare Arabic text byte-exact after parsing, with no silent normalization; classify differences for review rather than auto-fixing.
4. Require Malay translation surah/local/global identities and nonempty text. Validate `ms.basmeih` edition metadata and publisher independently before accepting an imported file.
5. Compare `juz` for every verse when both Arabic sources supply it. Additionally require an independently reviewed canonical Juz boundary table; without it, report Juz boundary coverage as **unverified**, not PASS.
6. Include negative cases: missing/duplicate/reordered surah, missing/duplicate/reordered ayah, shifted global ID, wrong translation edition, altered Arabic code point, missing Juz, shifted Juz boundary, malformed hash, absent license, truncated JSON and malicious metadata.
7. Produce a machine-readable discrepancy report, counts, source hashes and explicit `unverified` flags. Never print verse content or credentials in CI logs.
8. Review source terms and independently verify religious authenticity before any production adoption.

## External repositories
- `kodepandai/colorful-quran`: review presentation and attribution; do not assume Arabic/translation equivalence.
- `quran/tajweed`: experimental rule engine, not an authoritative corpus.
- `misraj-ai/quranhub`: inspect API edition metadata and license before integration.
- `cpfair/quran-tajweed`: character offsets depend on a specific Tanzil text revision; reject offset reuse without exact corpus hash.
- `semarketir/quranjson`: use structural counts as a cross-check, not an unreviewed source of truth.

## Release gates
The deterministic tests establish validator behavior only. Actual 6,236-ayah text parity, independently reviewed Malay accuracy, all Juz boundary coverage, source licensing and production readiness remain **UNVERIFIED** until independently acquired source files and signed-off provenance evidence exist. No deployment, no production or main branch changes.
