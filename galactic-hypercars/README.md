# WEBTRADE 3000

Nyilvános, önálló GitHub Pages demó: https://ae6820dc.github.io/webtrade/galactic-hypercars/

1000 egyedi fiktív hiperautó, 32 képzeletbeli gyártó, 3000 repositoryban tárolt SVG-galérianézet. Magyar prémium felület, teljes szűrés, hét rendezés, 18-as lapozás, legfeljebb négy autós összehasonlítás, kedvencek, piaci statisztikák, mentett keresések, megtekintési előzmények és neon témák.

Minden látogató független, helyi piacot kap. A nyilvános `catalog-data.js` induló katalógus nem módosul. A fiókok, saját hirdetések és tömörített képek, kedvencek, beállítások, tulajdonjogok, vásárlások és bizonylatok a stabil `webtrade-3000` IndexedDB adatbázisban élnek. A normál frissítés, böngésző-újraindítás és kijelentkezés nem törli őket. Nincs háttérkiszolgáló, felhőfiók vagy eszközök közötti szinkronizálás. A helyi tároló nem szerveroldali biztonsági határ.

A regisztráció egyedi, kis-/nagybetűtől független felhasználóneveket és legalább nyolc karakteres jelszavakat használ. Web Crypto PBKDF2-SHA-256, 310000 iteráció és egyedi 128 bites véletlen só; nincs nyílt szövegű jelszótárolás. A helyi munkamenet újraindítás után megmarad; közös eszközön ki kell lépni.

**DEMO PAYMENT — NO REAL MONEY. Soha ne adj meg valódi bankkártyaadatot.** Bármely kitöltött kitalált kártyaadat elfogadható 16 számjegyű számmal. Nincs banki ellenőrzés, pénztárca, egyenleg vagy pénzügyi API. A teljes szám, CVV, név és lejárat nem mentődik; opcionálisan csak címke és utolsó négy számjegy tárolható. A vásárlás, tulajdonjog és bizonylat egyetlen readwrite tranzakcióban mentődik, egyedi tulajdonjogkulccsal a kettős vásárlás ellen.

Saját hirdetés létrehozható, előnézhető, publikálható, szerkeszthető, törölhető és eladottnak jelölhető. Megvásárolt jármű hirdetése zárolt. Legfeljebb hat JPG/PNG/WebP kép, 15 MB/kép; kliensoldali 1200 px / WebP tömörítés. Az export/import ellenőrzi az adatokat, új hirdetési azonosítókat készít és nem visz át fiókot vagy vásárlási tulajdonjogot. Normál exportban nincs jelszó, hash, CVV vagy teljes kártyaszám. A képeket és leírásokat tartalmazó exportot bizalmasan kezeld.

## Források

- `index.html`, `styles.css`: magyar reszponzív felület
- `app.js`: kliensoldali nézetek és működő felhasználói folyamatok
- `storage.js`: verziózott IndexedDB, PBKDF2, atomi vásárlás
- `catalog.js`: determinisztikus generátor, szűrés és SVG formatervezés
- `catalog-data.js`: pontosan 1000 nyilvános induló rekord
- `assets/fleet-*.svg`: 40 helyi SVG lap, 3000 natív view-fragment
- `generate-assets.js`: induló rekordok és képek reprodukálása (`npm run generate`)
- `tests/`: katalógus- és Chromium E2E ellenőrzések

## Fejlesztés és teszt

Statikus HTTP-szerverrel szolgáld ki ezt a mappát. A Web Crypto HTTPS-en vagy localhoston működik; a GitHub Pages HTTPS-t biztosít. A látogatóknak semmit nem kell beállítaniuk.

```
npm install
npx playwright install --with-deps chromium
npm test
```

A böngészőteszt valóban leállítja és újraindítja a Chromium folyamatát megtartott profillal. Külön vizsgálja a fiókokat, képkezelést, vásárlást, kettős vásárlást, adatmegőrzést, import/exportot és mobilnézetet. A mobilteszt emuláció; nem igazol fizikai Android 16 eszközön végzett tesztet.

## Publikálás

A `webtrade-pages.yml` workflow először tesztel, utána a teljes repositoryt GitHub Pagesre publikálja, így a meglévő oldalak megmaradnak. Az eredeti `generate-index.yml` változatlan; automatikusan hozzáadja az új mappát a gyökérindexhez. Ha a repositoryban a Pages nincs engedélyezve, vagy az automatikus engedélyezést a GitHub nem engedi, a tulajdonosnak egyszer a Settings → Pages → Source → GitHub Actions lehetőséget kell választania. A látogatóknak nincs konfiguráció.

## Korlátok

Minden műszaki adat, tulajdonjog, fizetés és bizonylat fiktív. Nincs üzenetküldés az eladónak; a kapcsolati űrlap egyértelmű helyi szimuláció. A képek SVG formaterv-illusztrációk, nem fotók. Privát mód, tárhelykorlát vagy a böngészőadatok törlése korlátozhatja az adatmegőrzést. Más látogatók nem látják a helyi hirdetéseket, eladásokat vagy garázsokat. Az adatbázis séma verziója 1; későbbi fejlesztéseknél csak additív migrációval szabad frissíteni.
