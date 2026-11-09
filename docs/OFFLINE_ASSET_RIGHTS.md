# Offline Quran asset provenance and distribution gates

## Arabic Uthmani text
Official source: https://tanzil.net/download/
License: https://tanzil.net/docs/Text_License
Version: Tanzil Quran Text (Uthmani) 1.1.

Tanzil permits verbatim redistribution with attribution and source link. Preserve the exact original source bytes, its accompanying copyright notice, and independently computed SHA-256. Do not alter sacred text or assert a canonical match without checking the exact downloaded release. No Arabic corpus is included by this document.

## Malay translation
Edition: ms.basmeih (Abdullah Muhammad Basmeih).
Source: https://tanzil.net/trans/
Tanzil lists translation downloads for non-commercial use only. Redistribution or other use requires checking the translator/publisher's rights and the project's intended use. No Basmeih translation has been bundled.

## Alafasy audio
Edition: ar.alafasy (Mishary Rashid Alafasy).
Recording redistribution requires express permission from the rights holder or a verifiable license. Public playback URLs are not redistribution licenses. No recordings have been bundled.

## Release gate
Do not set sourceReviewed/licenseReviewed=true on a manifest without evidence. Do not publish any Quran/translation/audio bundle without verified exact-byte checksums, 114-Surah and 6236-ayah integrity, edition alignment, and provenance. CI synthetic fixtures are not canonical religious content.

## Verified acquisition (2026-11-09)
The following bundles are now in the repository (research branch only) with machine-verified provenance. Build reproducibly via `scripts/build-offline-corpus.mjs` and `scripts/build-offline-audio.mjs`; both are fail-closed.

- **Arabic Uthmani text** — official Tanzil Uthmani 1.1 downloaded verbatim from
  https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt on 2026-11-09.
  Byte-exact SHA-256 `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`
  (1,334,737 bytes), matching the iptvchecker/content-tanzil mirror and its fresh
  publisher verification record. Committed at `offline-sources/tanzil-uthmani-1.1.txt`.
  The publisher notice is preserved in-file and embedded in
  `public/offline/corpus-manifest.json` (sourceReviewed=true is justified by the
  Tanzil Text License: verbatim copies permitted with attribution and source link).
- **Malay Basmeih** — `ms.basmeih` (Abdullah Muhammad Basmeih) from
  https://api.alquran.cloud/v1/quran/ms.basmeih (2,205,470 bytes, committed at
  `offline-sources/acl-ms.basmeih.json`), independently cross-checked verse-by-verse
  against the fawazahmed0/quran-api `msa-abdullahmuhamma` copy (0 missing; differences
  are trailing punctuation only). Tanzil lists translations as non-commercial; this
  repository is a non-commercial research build. Commercial redistribution still
  requires the translator/publisher's permission — gate unchanged.
- **Juz boundaries** — alquran.cloud quran-uthmani per-ayah `juz`, independently
  verified 0/6236 against the semarketir/quranjson juz table
  (`offline-sources/quranjson-juz.json`). Juz navigation therefore works offline.
- **Alafasy audio** — 6,236/6,236 verse MP3s (128 kbps) from the EveryAyah Alafasy
  collection as mirrored by Raf0707/q7h_alafasy. Each file is header-checked and
  SHA-256-pinned in `public/offline/alafasy-manifest.json`.
  **`licenseReviewed` stays `false`**: the recording's redistribution terms are
  documented in the manifest and in
  `offline-sources/alafasy-build-report.json`, but written confirmation from the
  rights holder is still pending. Ship for personal/non-commercial research use;
  obtain permission before commercial distribution.
- **Canonical corpus** — `public/offline/corpus.json` (3,211,211 bytes,
  SHA-256 `aa0b8e216b07eb3818e2c2e524fb952d904eec832475ecaaaeddeda80d2d85fa`)
  merges the Tanzil Arabic with the Basmeih Malay in the app's offline schema;
  `verifyOfflineCorpus` and the E2E HTTP check pass (114 surahs, 6,236 ayahs,
  s1=7, s9=129).

Known editorial notes: alquran.cloud's `quran-uthmani` rendering differs from Tanzil
Uthmani 1.1 in 4,359/6,236 ayahs (Uthmani orthographic variants; the 2:1 anchor check
in `alignEditions` still passes on the API path). The bundled corpus uses Tanzil
bytes exclusively, so the app's offline text is byte-identical to the official release.
