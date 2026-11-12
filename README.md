# Al-Quran with Tajweed

React/Vite Quran reader, research branch. **Offline-first for text, on-demand
for audio**: the complete Quran (Tanzil Uthmani 1.1 Arabic + Basmeih Malay) and
all provenance manifests are bundled and checksum-verified, so reading, search
and juz navigation work with no network. Alafasy verse audio is **downloaded
on demand, per verse**, from the pinned audio-pack site, verified by SHA-256
and cached on the device (IndexedDB); playback falls back to CDN streaming if
a download fails. Tajweed color annotations are **not yet verified**; no
unverified colors are applied.

## Bundled in `public/offline/` (ships in the APK, ~4 MB)

| Asset | Source | Verification |
| --- | --- | --- |
| `corpus.json` (3.2 MB) | Arabic: official Tanzil Uthmani 1.1 (SHA-256 `ac072479…`); Malay: `ms.basmeih` via alquran.cloud, cross-checked against fawazahmed0/quran-api | `verifyOfflineCorpus` (114 surahs / 6,236 ayahs, byte-exact pairing, 2:1 anchor) |
| `corpus-manifest.json` | provenance + SHA-256 of corpus.json | fail-closed on any mismatch |
| `alafasy-manifest.json` (1.1 MB) | per-verse SHA-256 for all 6,236 Alafasy recordings | `validateOfflineAlafasyManifest` (fail-closed) |

## On-demand audio (not compiled into the APK)

- Source: `audio-pack` branch (same repository, GitHub Pages project site),
  served at `https://mohd012z.github.io/quran/audio-pack/<verse>.mp3`
  (CORS `*`; real MP3 bytes, not LFS pointers).
- Flow: play Alafasy verse → cache hit? verify + play : fetch MP3 → verify
  SHA-256 against `alafasy-manifest.json` → cache in IndexedDB → play.
  Any failure returns to CDN streaming (`cdn.islamic.network`), so audio never
  blocks reading.
- The `audio-pack` branch stores the 6,236 MP3s (818 MB) as plain git blobs so
  GitHub Pages serves them directly; it is isolated from the app code and CI.
- Rebuild the audio pack (in the `audio-pack` worktree, fail-closed):
  copy the verified 6,236 MP3s (from `Raf0707/q7h_alafasy`, `SSS/SSSAAA.mp3`)
  into `audio-pack/<GLOBAL_VERSE>.mp3`, then
  `node scripts/verify-audio-pack.mjs audio-pack` before push (checks every
  byte against `alafasy-manifest.json`).
- Rebuild deterministically (fail-closed, no network):
  `node scripts/build-offline-corpus.mjs` (text + Malay + juz → corpus.json),
  `node scripts/build-alafasy-manifest.mjs <q7h-alafasy-root>` (regenerates
  alafasy-manifest.json from the same source tree that feeds the pack).

Juz navigation (30 juz) is derived from the verified corpus and needs no
network. Alafasy **recording** redistribution rights are documented but pending
written confirmation — `licenseReviewed:false` in the manifest (see
`docs/OFFLINE_ASSET_RIGHTS.md`).

## Reproducible runbook

1. Install Node.js 20+ and npm (and Git LFS for the source corpus). `node --version && npm --version && git lfs version`.
2. `git clone https://github.com/mohd012z/quran.git`
3. `cd quran && git checkout <research-branch> && git lfs pull`
4. `npm install --no-audit --no-fund` — expect exit code 0.
5. `npm test` — expect 331 tests passing.
6. `npm run build` — expect generated `dist/` (~4.5 MB, **zero MP3 files**).
7. `npm run dev` — expect localhost:5173.
8. In browser verify: Surah + Juz navigation, Arabic + Malay text, verse audio
   (on-demand + cached for Alafasy, CDN for other qaris), bookmarks, settings,
   and network error states. To prove the offline text path, run the dev
   server with no internet: reading, search and juz navigation keep working;
   Alafasy playback falls back to the "audio unavailable" state.

## Data sources
- [FACT] https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt — canonical Arabic, byte-exact Uthmani 1.1 (bundled).
- [FACT] https://api.alquran.cloud/v1 — online editions, translations, audio CDN (fallback + non-Alafasy qaris).
- [FACT] https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/msa-abdullahmuhamma.json — independent Basmeih cross-check (bundled in `offline-sources/`).
- [FACT] https://github.com/semarketir/quranjson — independent juz boundary table (bundled in `offline-sources/`).
- [FACT] https://github.com/Raf0707/q7h_alafasy — Alafasy verse audio (served on demand from the `audio-pack` branch / GitHub Pages).
- [FACT] https://react.dev/reference/react — React. https://vite.dev/guide/ — Vite. https://nodejs.org/api/test.html — Node tests.
- [INFERENCE] Arabic Al-Muyassar is commentary, not a literal Arabic translation (not bundled; tafsir tab stays empty until verified).
- [UNAVAILABLE] Complete reviewed Tajweed annotation mapping. Unannotated text remains uncolored.

## Release gates
Verify all 114 Surahs, 30 Juz verse boundaries, edition alignment, on-demand audio download + SHA-256 verification + IndexedDB cache, accessibility, and Tajweed metadata before merge. Resolve the Alafasy recording redistribution confirmation before commercial distribution. No production deployment, live trading, or billing changes.
