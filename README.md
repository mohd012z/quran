# Al-Quran with Tajweed

React/Vite Quran reader, research branch. **Offline-first**: the complete Quran
(Tanzil Uthmani 1.1 Arabic + Basmeih Malay) and full Alafasy verse audio are
bundled and checksum-verified, so the app runs with no network connection.
Tajweed color annotations are **not yet verified**; no unverified colors are
applied.

## Offline content (bundled in `public/offline/`)

| Asset | Source | Verification |
| --- | --- | --- |
| `corpus.json` (3.2 MB) | Arabic: official Tanzil Uthmani 1.1 (SHA-256 `ac072479…`); Malay: `ms.basmeih` via alquran.cloud, cross-checked against fawazahmed0/quran-api | `verifyOfflineCorpus` (114 surahs / 6,236 ayahs, byte-exact pairing, 2:1 anchor) |
| `corpus-manifest.json` | provenance + SHA-256 of corpus.json | fail-closed on any mismatch |
| `alafasy-manifest.json` | per-verse SHA-256 for all 6,236 MP3s | `validateOfflineAlafasyManifest` (fail-closed) |
| `alafasy/*.mp3` (818 MB, Git LFS) | EveryAyah Alafasy 128 kbps (Raf0707/q7h_alafasy mirror) | header + SHA-256 per playback (`verifyOfflineAlafasyRecording`) |

Juz navigation (30 juz) is derived from the verified corpus and needs no network.
Audio playback is offline for the Alafasy qari; other qaris use the online CDN.
Alafasy **recording** redistribution rights are documented but pending written
confirmation — `licenseReviewed:false` in the manifest (see
`docs/OFFLINE_ASSET_RIGHTS.md`).

Rebuild the bundles deterministically (fail-closed, no network):

```bash
node scripts/build-offline-corpus.mjs                     # text + Malay + juz
node scripts/build-offline-audio.mjs <q7h-alafasy-root>   # 6,236 MP3s + manifest
```

## Reproducible runbook

1. Install Node.js 20+ and npm (and Git LFS for the audio). `node --version && npm --version && git lfs version`.
2. `git clone https://github.com/mohd012z/quran.git`
3. `cd quran && git checkout <research-branch> && git lfs pull`
4. `npm install --no-audit --no-fund` — expect exit code 0.
5. `npm test` — expect 326 tests passing.
6. `npm run build` — expect generated `dist/` including `dist/offline/` (835 MB).
7. `npm run dev` — expect localhost:5173.
8. In browser verify: Surah + Juz navigation, Arabic + Malay text, verse audio
   (offline for Alafasy), bookmarks, settings, and network error states.
   To prove offline mode, run the dev server with no internet and confirm the
   reader, Malay translation and Alafasy audio still work.

## Data sources
- [FACT] https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt — canonical Arabic, byte-exact Uthmani 1.1 (bundled).
- [FACT] https://api.alquran.cloud/v1 — online editions, translations, audio CDN (fallback + non-Alafasy qaris).
- [FACT] https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/msa-abdullahmuhamma.json — independent Basmeih cross-check (bundled in `offline-sources/`).
- [FACT] https://github.com/semarketir/quranjson — independent juz boundary table (bundled in `offline-sources/`).
- [FACT] https://github.com/Raf0707/q7h_alafasy — Alafasy verse audio mirror (bundled via Git LFS).
- [FACT] https://react.dev/reference/react — React. https://vite.dev/guide/ — Vite. https://nodejs.org/api/test.html — Node tests.
- [INFERENCE] Arabic Al-Muyassar is commentary, not a literal Arabic translation (not bundled; tafsir tab stays empty until verified).
- [UNAVAILABLE] Complete reviewed Tajweed annotation mapping. Unannotated text remains uncolored.

## Release gates
Verify all 114 Surahs, 30 Juz verse boundaries, edition alignment, audio playback, accessibility, and Tajweed metadata before merge. Resolve the Alafasy recording redistribution confirmation before commercial distribution. No production deployment, live trading, or billing changes.
