# Al-Quran with Tajweed

React/Vite Quran reader, research branch. Tajweed annotations are **not yet verified**; no unverified colors are applied.

## Reproducible runbook

1. Install Node.js 20+ and npm. Run `node --version && npm --version`.
2. `git clone https://github.com/mohd012z/quran.git`
3. `cd quran && git checkout research/quran-tajweed-foundation-20261108`
4. `npm install --no-audit --no-fund` — expect exit code 0.
5. `npm test` — expect 5 tests passing.
6. `npm run build` — expect generated `dist/`.
7. `npm run dev` — expect localhost:5173.
8. In browser verify Surah navigation, Arabic, English, Arabic tafsir, verse audio, settings and network error states.

## Data sources
- [FACT] https://alquran.cloud/api — Quran metadata, editions, Surah and audio APIs.
- [FACT] https://react.dev/reference/react — React.
- [FACT] https://vite.dev/guide/ — Vite.
- [FACT] https://nodejs.org/api/test.html — Node tests.
- [INFERENCE] Arabic Al-Muyassar is commentary, not a literal Arabic translation.
- [UNKNOWN] Exact edition IDs, audio coverage and Juz boundary navigation need live validation.
- [UNAVAILABLE] Complete reviewed Tajweed annotation mapping. Unannotated text remains uncolored.

## Release gates
Verify all 114 Surahs, 30 Juz verse boundaries, edition alignment, audio playback, accessibility, and Tajweed metadata before merge. No production deployment, live trading, or billing changes.
