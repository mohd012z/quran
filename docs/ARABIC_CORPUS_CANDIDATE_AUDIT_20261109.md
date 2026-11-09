# Arabic Quran candidate source audit — 2026-11-09

Candidate: https://github.com/mjmirza/quran-dataset
Official reference: https://tanzil.net/docs/Text_License

## Confirmed
- Candidate README advertises 114 Surahs, 6236 ayahs and CC BY 4.0.
- Candidate LICENSE retrieved from GitHub says "OpenRoots Agent License 2.3" (SPDX LicenseRef-OpenRoots-ORA-2.3), conflicting with the README. The candidate NOTICE also references CC BY 4.0.
- Tanzil's official text license permits verbatim copies with attribution and forbids changing the text.
- GitHub contents fetch for candidate data/quran.json exposed an object SHA but no text bytes through the available connector.
- Local git clone failed with DNS resolution failure for github.com.

## Not verified
- Exact corpus bytes and SHA-256
- Per-ayah byte-for-byte equality with canonical Tanzil Uthmani edition
- Whether candidate licensing permits redistribution of the packaged dataset
- Complete Quran corpus inside this project's repository or APK

## Release gate
DO NOT bundle candidate dataset or assert verification until exact bytes can be retrieved, 114 Surahs / 6236 ayahs and every verse can be independently compared against a pinned official Tanzil edition, source-specific notices retained, and the conflicting LICENSE resolved. Do not bundle Basmeih or Alafasy recordings without confirmed redistribution permission.
