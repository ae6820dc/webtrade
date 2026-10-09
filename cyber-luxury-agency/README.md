# NOIR Privé — Cyber Luxury Agency

Magyar nyelvű, statikus luxus companion piactér-demó, kizárólag fiktív, legalább 21 éves karakterekkel. **Minden foglalás, üzenet, értékelés, ellenőrzés és tranzakció szimulált.** Nincs valódi szolgáltatás, személyes kapcsolatfelvétel, bankkártyaadat vagy pénzmozgás.

Tervezett és a repositoryhoz tartozó Pages-cím: https://ae6820dc.github.io/webtrade/cyber-luxury-agency/

## Indítás

Node 22.8+ (ajánlott: 24) és Python 3 szükséges a fejlesztői parancsokhoz. Az alkalmazásnak nincs runtime vagy npm függősége.

```sh
cd cyber-luxury-agency
npm run serve
# http://localhost:8000/
npm test
```

HTTP(S) szerverről használd, ne file:// megnyitással: a modulok és a JSON-katalógus böngészős betöltése HTTP-t igényel. GitHub Pages alkönyvtárban is működik: minden asset és modul relatív elérésű, a navigáció hash alapú.

## Funkciók

- 18+ belépési nyilatkozat, 216 különböző 21–49 éves női karakter, egyedi név és bemutatkozás, 7 város és több városrész.
- Három eredeti digitális galérianézet minden profilhoz (648 nézet), divatstílus, nyelvek, kategóriák, csomagok, 30 napra tervezhető heti elérhetőség.
- Név/város/hangulat keresés, ékezetfüggetlen javaslatok, kerület-, kor-, ár-, kategória-, dátum-, értékelés-, prémium- és demóellenőrzés-szűrők; hatféle rendezés.
- Mentett keresések, kedvencek, legutóbb megtekintett profilok, egyszerű kategória/város alapú ajánlás és négyprofilos összehasonlítás.
- Demóregisztráció és belépés; látogató, ügyfél, hirdető és adminisztrátor nézet. Regisztrált admin helyett szabadon elérhető, egyértelműen jelölt admin-demóbelépés.
- Csomag/időtartam választás, szabad kezdési idők, ütközésellenőrzés a teljes időtartamra, összesítő, promóciók, tagsági kedvezmény, szimulált fizetés és visszaigazolás.
- 25 000 kezdő demókredit fiókonként, virtuális feltöltés, egyszeri tagságok, hűségpont-beváltás, tranzakciós előzmények és letölthető TXT-demóbizonylatok.
- Lemondás és egyszeri teljes visszatérítés; hirdetői/admin státuszfrissítés és lezárás.
- Saját hirdetés készítése/szerkesztése, képfeltöltés, kategória/óradíj/elérhetőség szerkesztése, mentett előnézet, moderálási státusz, megvásárolható virtuális kiemelés és helyi analitika.
- Admin profiljóváhagyás/elutasítás/felfüggesztés, jelentések lezárása, fiktív vélemények elrejtése/visszaállítása, kategória- és kampánykezelés, pénzügyi kimutatás és auditnapló.
- Helyi értesítések, szimulált belső üzenetek automatikus válasszal, adatmentés/import, reset és sérült adat biztonsági példányának exportálása.

## Architektúra és adatkezelés

- `profiles.json`: statikus karakteradatok, elválasztva az alkalmazáslogikától.
- `generate-data.js`: determinisztikus adat- és SVG-generátor; `npm run generate` reprodukálja a kollekciót. Csak e projekt fájljait írja.
- `core.js`: tiszta domainműveletek, szerepkörök, szűrés, árak, kreditkönyvelés, foglalások, demóbizonylat és mentésséma.
- `storage.js`: IndexedDB v2; egy atomikus readwrite tranzakcióban olvasás–ellenőrzés–módosítás–mentés. Több lap írásai sorosulnak. A BroadcastChannel frissíti a többi lapot és bezárja az elavult dialogot.
- v1 mentések v2-re migrálhatók. Hibás adat elkülönített `corrupt-backup` kulcsra kerül; új, érvényes demóállapot indul. Import előtt ellenőrzés történik, hibás import nem írja felül az aktuális adatokat.
- IndexedDB nélkül látható figyelmeztetésű memóriamód működik, tartós mentés nélkül. Böngészőkvóta vagy mentési hiba esetén nincs részleges kreditköltés.
- `app.js` és `styles.css`: függőségmentes, reszponzív kliens, natív dialogok, billentyűzetes fókusz, skip link, állapotüzenetek és csökkentett animáció.

A demójelszavak helyben, olvasható adatként tárolódnak és exportálódnak. Ez szándékosan **nem valódi hitelesítés vagy hozzáférésvédelem**. Valódi jelszó, név, e-mail, telefonszám vagy személyes kép ne szerepeljen benne. A kedvencek/keresések böngészőszintűek; a pénztárcák/foglalások/üzenetek fiókonként különülnek el. A demóval azonos GitHub Pages origin más alkalmazásai technikailag hozzáférhetnek a böngészőtárolóhoz: ezért kizárólag fiktív adat használható.

## Ellenőrzés

```sh
npm test
# 14 domain/adat/perzisztencia teszt
python3 -m pip install playwright
# Chromium szükséges, CHROMIUM_PATH-tal választható bináris
npm run test:browser
```

A 7 Chromium-integrációs teszt saját localhost szervert indít és izolált böngészőkontextusokat használ. Korhatár, reszponzivitás, keresés, galéria, kedvencek, összehasonlítás, regisztráció, fizetés, lemondás, bizonylat, wallet, hirdetés/moderálás, kampányok, több-lapos IndexedDB, adatmentés/import, sérült adat és reset ellenőrzését tartalmazza. Képernyőképeket alapértelmezésben a rendszer temp mappájába ír (`NOIR_TEST_RESULTS` felülírhatja).

A készítéskor a 14 Node-teszt sikeresen futott. A helyi Chromium-futtatást a sandbox socketkorlátozása blokkolta; a külön futtatási engedélykérés megszakadt. **A Chromium-tesztek elkészültek, de ebben a környezetben nem igazoltan lefutottak.** Lásd `tests/RESULTS.md`.

## GitHub Pages és a meglévő repository

A `galactic-hypercars/` és a meglévő workflow-fájlok változatlanok. A repository `Generate repository index` workflow-ja automatikusan felveszi az új projektmappát; a mappán belül az `index.html` nyitja meg az alkalmazást.

A jelenlegi `Webtrade tests and Pages deployment` workflow csak a `galactic-hypercars/**` útvonal változásaira indul push eseménykor. Ezzel párhuzamosan a repository aktuális Pages-beállítása a main ágról automatikus `pages build and deployment` futást indított az új projekt és az index commitjára is. A külön Webtrade workflow szükség esetén a **Run workflow** művelettel indítható a main ágon. Régi publish job újrafuttatása duplikált `github-pages` artifact hibát okozhat, ezért új workflow-futást használj. A Webtrade workflow továbbra is az autós projekt tesztjeit futtatja; a NOIR tesztek külön futtathatók a fenti parancsokkal. Az összes új projektfájl e mappán belül van.

## Korlátok és képek

- A portrék eredeti, stilizált procedurális SVG-illusztrációk, nem luxusfotók. Három galérianézet karakterenként eltérő színvilágot mutat; ezek nem külön fotózások. A generátor meghatározott arcvonás- és ruhavariációkat kombinál, ezért a vizuális stílus egységes.
- Nincs backend, valódi felhasználóközi kommunikáció, tényleges identitásellenőrzés, tényleges életkor-ellenőrzés vagy fizetés.
- A generált értékelések és induló nézettségi számok fiktívek. A saját hirdetések analitikája helyi műveletekből számolódik.
- A kategóriák kulturális, társasági és virtuális programdemók, nem valódi felnőtt szolgáltatások.
- Egy hirdetés alap-óradíja közös a kiválasztott kategóriákra; a három csomag felára rögzített. A heti naptár napokat enged szerkeszteni, a nyitvatartás 14:00–22:00.
- Maximum 4 órás programok, 30 napos előretervezés; múltbeli napszakot nem szimulálunk valós időpontszolgáltatásként.
- Adminlisták 30 kereshető tételt mutatnak; audit 500, értesítés 200, jelentés 200, mentett keresés 10, képfeltöltés hirdetésenként 3 × 500 KB, import 10 MB.
- A hirdetéselőnézet a hirdetést menti és moderálásra küldi; a felület ezt jelzi.

Magyar használati útmutató: [USER-GUIDE.hu.md](./USER-GUIDE.hu.md).
