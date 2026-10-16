# Ellenőrzési eredmények — 2026-10-09

- Node v24.19.0: `npm test` — **14 sikeres, 0 hibás** teszt.
- `node --check app.js`, `node --check core.js`: sikeres szintaxisellenőrzés.
- `python -m py_compile tests/browser_test.py`: sikeres Python-szintaxisellenőrzés.
- 216 egyedi profilnév, bio és azonosító; mind 21+; 648 digitális galérianézet; minden hivatkozott SVG létezik.
- Valódi Chromium-integrációs teszt: **nem lefutott**. A sandbox `setsockopt: Operation not permitted` hibával blokkolta a böngészőt; a helyi HTTP-szerver socketje is blokkolt. Két engedélykérés megszakadt, ezért böngészős vagy vizuális ellenőrzés sikerét nem állítjuk.

A kritikus logikai tesztek: kombinált szűrés és rendezés, ékezetfüggetlen keresés, regisztráció és belépés, szerepkörök, kedvezmény/árszámítás, időpontütközés és teljes időtartam, elégtelen egyenleg, wallet-összegek, tagság, hűségpontok, egyszeri lemondás/visszatérítés, saját hirdetés és moderálás, üzenetdemó, atomikus memóriamód-visszagörgetés, adatimport/migráció/reset és sérült mentés elutasítása.

A `browser_test.py` további hét valódi Chromium-tesztet tartalmaz, köztük az IndexedDB párhuzamos írása, hibás adatok helyreállítása és UI-checkout. Ezek futtatása a célkörnyezetben javasolt; nem számítanak a 14 sikeres teszt közé.

## Issue #1 verification (2026-10-16)

- `npm test`: 15 passing domain tests, including fixed distinct Program IDs, PIN rejection, generated username format and profile isolation.
- `npm run test:browser`: 7 passing Chromium integration tests plus the cross-app same-origin profile suite.
- `CHROMIUM_PATH=/usr/bin/chromium npm test` in galactic-hypercars: catalog checks and 18 passing browser scenarios.
- Cross-app checks cover wrong PIN, cancellation, accepted PIN, collision retry, reload, independent favorites/balances, app-specific storage, and the retained NOIR age declaration.
