# Tuletornijaht — disainisüsteem

Visuaalne süsteem Eesti tuletornide kontrollnimekirjale. Süsteem on merine:
neli veetooni taevast sügavikuni, nende kõrval üks soe liivatoon ja üks
punane — Narva-Jõesuu torni vöödi punane. Kõik muu peab nende juures
vaikima. Värvid on mõõdetud Julia enda fotodelt.

Tokenid elavad failis `styles.css` `:root` plokis. Kui muudad siin väärtust,
muuda ka seal — teist allikat ei ole.

## Mille järgi otsuseid teha

**Nimekiri enne kaunistust.** Leht on register: neljakümne torni andmed
peavad mahtuma võimalikult vähesele kerimisele. Kui valik on „ilusam“ või
„rohkem korraga näha“, võidab teine.

**Foto on ainus pilt.** Süsteem ei joonista ikoone ega illustratsioone.
Torni kõrgust näitab riba, mitte pilt.

**Andmed monoshriftis, jutt groteskis.** Kõik, mida saab kõrvuti võrrelda —
aasta, kõrgus, märgi number, loendur — läheb `--font-mono` perekonda
`font-variant-numeric: tabular-nums` arvudega. Kõik, mida loetakse lausena,
läheb `--font-sans` perekonda.

**Joon, mitte vari.** Pindu eraldab `--line-200`. Ainus vari süsteemis on
`--shadow-sticky` kleepuva päise all.

**Nurgeline.** Vaikeraadius on 0. Ümar on ainult see, mida sõrmega
vajutatakse: filtrinupud ja sildid (`--radius-pill`), sisendid
(`--radius-sm`), fotoplaadid (`--radius-md`).

## Värv

Üks teema, päevavalgus. Tumedat teemat ei ole: fotod on tehtud
päevavalguses ja neid ei tasu tumedal taustal ümber häälestada.

| Token | Väärtus | Kasutus |
| --- | --- | --- |
| `--surface-page` | `#e9eff2` | Lehe taust. Kahvatu, selgelt sinakas merevalgus. |
| `--surface-card` | `#ffffff` | Nimekirja read ja kaardid, mis tõusevad taustast esile. |
| `--surface-sunk` | `#dce6ea` | Süvend: edenemisriba soon, tühjad pesad. |
| `--surface-marked` | `#fbeaeb` | Rea taust, kui torn on külastatud. |
| `--ink-900` | `#12242e` | Pealkirjad ja põhitekst. Sügava vee tume sinakashall. |
| `--ink-600` | `#3f5a67` | Teisene tekst: kirjeldused, sissejuhatused. |
| `--ink-400` | `#556e79` | Vaikne tekst: andmerida, sildid, abitekst. |
| `--line-200` | `#cddce2` | Peenjoon ridade vahel ja sisendite ääris. |
| `--line-300` | `#b3c7d0` | Tugevam ääris. Mitte tekstile. |
| `--signal-600` | `#c0323a` | Peaaktsent: Narva-Jõesuu torni punane vööt. |
| `--signal-700` | `#96222a` | Signaalpunane väikeses tekstis, kus on vaja 4.5:1. |
| `--sea-900` | `#0e3a52` | Sügav vesi. Tumedad täited. |
| `--sea-600` | `#1f6e92` | Merevesi. Teine aktsent: lingid, teave. |
| `--sea-300` | `#7fb2c9` | Madal vesi. Ainult täide. |
| `--sea-100` | `#c3dae5` | Taevas ja vaht: fotode raamid, rahulikud rõhud. |
| `--dune-500` | `#b5a06a` | Liivaka ainus soe toon. Ainult täide. |
| `--pine-700` | `#2e4a45` | Rannamänni tume sinakasroheline. |

Veeskaala on süsteemi selgroog: `--sea-100` on taevas ja vaht, `--sea-300`
madal vesi, `--sea-600` tööriistade aktsent, `--sea-900` sügavik. Kui
kahtled, millist sinist võtta, vali pinna järgi — mida allpool või
sügavamal, seda tumedam.

Signaalpunane tähendab lehel ainult ühte asja: **siin on käidud**. Ära
kasuta seda pealkirjades, ääristes ega dekoratsioonis, muidu kaob linnukese
tähendus. Vigade ja hoiatuste jaoks eraldi värvi ei ole — neid lehel ei
teki.

`--dune-500` ja `--sea-300` ei kanna teksti välja: need on ainult täited.
Kontrollitud kontrastid `--surface-page` peal: `--ink-900` 13.7:1,
`--ink-600` 6.3:1, `--ink-400` 4.65:1, `--signal-600` 4.8:1,
`--signal-700` 7.1:1, `--sea-600` 4.9:1, `--pine-700` 8.3:1.

## Kiri

Kaks perekonda, mõlemad Google Fontsist — eraldi fondifaile projektis ei
hoita.

- `--font-sans` — **Archivo**. Neutraalne grotesk, mis kannab nii 46px
  pealkirja kui 13px jalust. Pealkirjades `-0.02em` kuni `-0.005em`
  tähevahet, mujal mitte.
- `--font-mono` — **IBM Plex Mono**. Ainult andmed ja sildid.

| Stiil | Suurus / reavahe | Kaal | Kus |
| --- | --- | --- | --- |
| display-xl | 46 / 46 | 700 | Lehe nimi. Üks kord lehel. |
| display | 30 / 34 | 700 | Suur arv edenemisribas. |
| title | 18 / 24 | 600 | Tuletorni nimi reas. |
| body | 15 / 22 | 400 | Kirjeldav tekst, rida kuni 65 tähemärki. |
| body-strong | 15 / 22 | 600 | Rõhk, nuppude kiri. |
| small | 13 / 18 | 400 | Jalus, abitekst. |
| label (mono) | 11 / 14, `0.12em` | 500 | Versaalides sildid ja filtrinupud. |
| meta (mono) | 11.5 / 16, `0.02em` | 400 | Andmerida. |
| figure (mono) | 28 / 30 | 500 | Loendur ja mõõdunumbrid. |

## Ruum ja raadius

`--space-1` 4px · `--space-2` 8px · `--space-3` 12px · `--space-4` 16px ·
`--space-5` 24px · `--space-6` 32px · `--space-8` 48px.

Lehe külgveeris on `--space-4`, rea sisepolster `--space-3` — sellest
tihedamaks ei lähe, muidu ei saa linnukest sõrmega tabada.

`--radius-sm` 3px sisenditele · `--radius-md` 6px fotoplaatidele ·
`--radius-pill` 999px nuppudele ja siltidele. Kõik muu on nurgeline.

## Komponendid

### TorniRida

Kolmeveeruline võrgustik: 26px linnukesele, 30px kõrgusribale, ülejäänu
tekstile, foto neljandas veerus. Kogu rida on `<label>`, nii et vajutus
ükskõik kuhu ritta märgib torni — **märkmeväli peab jääma `<label>`-ist
välja**, muidu kustutab kirjutamine linnukese.

Kõrgusriba kodeerib torni tegelikku kõrgust: `10px + (kõrgus / 52) * 38px`,
kus 52 on süsteemi kõrgeim torn (Pakri ja Sõrve). Alumine joon on ühine
nulljoon, mille vastu ribasid võrreldakse — ilma selleta on kõrgus lihtsalt
kaunistus. Märkimata riba on `--dune-500`, märgitud `--signal-600`.

Olekud: märkimata (`--surface-card`), märgitud (`--surface-marked`, nimi
`--signal-700`, märkmeväli nähtav), fookus (2px `--signal-600` kontuur 2px
nihkega — ära eemalda).

### Silt

Alati ääristega ja läbipaistva täitega — täidetud silt tõmbaks nimekirjas
rohkem tähelepanu kui torni nimi ise. Kiri ja ääris on sama `currentColor`.

| Silt | Värv | Tähendus |
| --- | --- | --- |
| Avatud | `--signal-700` | Registri järgi saab torni sisse |
| Ainult paadiga | `--sea-600` | Saareke, kuhu maanteed ei vii |
| Matkarada | `--pine-700` | Viimane lõik tuleb jalgsi läbida |

Ühel real on korraga üks silt. Kui torni kohta kehtib mitu, võidab see, mis
muudab külastuse planeerimist kõige rohkem — ligipääs enne avatust.

### Filtririba

Neli teineteist välistavat nuppu ja otsinguväli. Valitud nupp on
`--ink-900` täidisega, **mitte** `--signal-600` — punane tähendab lehel
ainult käidud torni. Otsing kitsendab seda, mille filter on juba valinud.
Tühja tulemuse puhul jääb sektsiooni pealkiri alles ja alla tuleb üks lause.

### Edenemisriba

Suur arv `--signal-600` värvi tabular-nums arvudega, nimetaja tavalises
suuruses `--ink-900` — see ei ole eraldi arv, vaid sama lause osa. Soon on
8px `--surface-sunk` taustal; täide läheb `--sea-900` → `--sea-600` →
`--signal-600`: vesi jääb selja taha, punane on see, mille poole minnakse.
`role="progressbar"` koos `aria-valuenow`-ga; värv ei ole ainus märk
edenemisest.

## Pildid

Fotod on Julia omad, autorit eraldi välja ei kirjutata. Kaanepilt on
nurgeline ja jookseb lehe serva (`object-fit: cover`), rea pisipilt on
`--radius-md` nurkadega, 96×64 ekraanil ja 200×134 failis.

Fotole teksti peale ei kirjutata ja filtreid ei panda. Uue foto lisamisel
hoia JPEG kvaliteet 74–78 kandis ja pikem külg alla 1400px, seejärel kirjuta
faili nimi `tuletornid.json`-i selle torni `foto` väljale.

Kaustas `images/` on ka kolm fotot, mille torn on veel määramata
(`maaramata-*.jpg`) — kui nimi selgub, nimeta fail ümber ja seo torniga.

## Fail failist

| Fail | Mis seal on |
| --- | --- |
| `index.html` | Lehe skelett: kaanepilt, päis, loendur, filtririba, jalus |
| `styles.css` | Tokenid `:root`-is ja kõik komponendid |
| `app.js` | Andmete laadimine, ridade ehitamine, filter, localStorage |
| `tuletornid.json` | Kõik 40 torni piirkondade kaupa — ainus andmeallikas |
| `images/` | Kaanepilt ja ridade pisipildid |
| `DESIGN.md` | See fail |
