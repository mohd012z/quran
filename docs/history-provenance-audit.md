# Islamic history and Hijri source provenance audit — 2026-11-08

## Evidence and classification
- **Official Malaysia dates (verified against published table):** `src/malaysia-hijri-events.js` contains eight 2026 dates matching the JAKIM 2026 important-dates PDF hosted by Jabatan Mufti Wilayah Persekutuan: https://muftiwp.gov.my/images/falak/takwim/tarikh_penting/TARIKH_Penting_Islam_2026.pdf. Ramadan, Aidilfitri and Aidiladha are marked subject to the Penyimpan Mohor Besar Raja-Raja's announcement. This PDF is a published calendar, not evidence that a subsequent official declaration occurred.
- **Quranic evidence (reference-level):** `src/history-reader.js` provides verse references rather than copied Arabic or translation. Example: 9:40 mentions the cave and companion in the Hijrah account; independently cross-checkable at https://corpus.quran.com/translation.jsp?chapter=9&verse=40. This validates the cited verse's relevance, **not** every interpretive statement across all chapters.
- **Unverified scholarship:** Original Malay chapter summaries are educational drafts. They have **not** undergone review by an Islamic studies scholar, hadith specialist or JAKIM. They must not be labelled 'scholarly reviewed', 'authenticated hadith', or 'complete history'.
- **Tajwid annotations:** `renderSegments(v.arabic,[])` supplies no authenticated rule spans; colored rule classes must not be interpreted as verified per-letter Tajwid guidance.
- **Translation and audio rights:** Arabic edition parity, Malay translation redistribution, and Qari audio redistribution remain separate unverified release gates.
- **Calendar approximation:** Device `Intl` Hijri output may differ from the official Malaysian takwim. Do not use the device calendar as the authoritative source for religious event notifications.

## Release gates
1. Record per-chapter source edition, author, publication metadata, source URL and reviewed passages.
2. Cross-check every chapter's cited verses and historical claims; distinguish Quran, authenticated hadith, and later Sirah traditions.
3. Obtain named scholarly editorial approval before advertising the summaries as reviewed or complete.
4. Validate Android notifications, date declarations, APK SHA-256 and signing evidence before distribution.
5. No changes to production or main; no automatic publication.
