/* Eesti tuletornijaht — nimekirja loogika.
   Andmed tulevad failist tuletornid.json, linnukesed elavad brauseri
   localStorage'is. Serverit ega sisselogimist ei ole. */
(function () {
  "use strict";

  var LS = "tuletornijaht.v2";
  var BADGES = { paat: ["b-boat", "Ainult paadiga"], jalgsi: ["b-walk", "Matkarada"] };

  /* Kõik failiteed lahendatakse dokumendi enda aadressi vastu. Nii töötavad
     nad ühtviisi kohalikus kaustas ja GitHub Pagesi alamkaustas
     (nt https://kasutaja.github.io/tuletornijaht/). Absoluutne tee "/images/..."
     osutaks Pagesis domeeni juurde ja annaks 404. */
  function url(path) {
    try {
      return new URL(String(path).replace(/^\.?\//, ""), document.baseURI).href;
    } catch (e) {
      return path;
    }
  }

  var state = { visited: {} };
  try {
    var raw = localStorage.getItem(LS);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.visited) state.visited = parsed.visited;
    }
  } catch (e) {}

  function saveLocal() {
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
  }

  function num(v) { return String(v).replace(".", ","); }

  /* Võõra foto juures peab autor ja litsents olema näha. Julia enda
     piltidel krediidirida ei ole. */
  function creditText(it) {
    if (!it.foto || !it.foto_autor || it.foto_autor === "Julia") return "";
    return "Foto: " + it.foto_autor + (it.foto_litsents ? " / " + it.foto_litsents : "");
  }

  /* Kõik võõraste fotode viited kogutakse jalusesse ühte loendisse -
     nimekirja read on liiga tihedad, et iga pildi alla rida mahutada. */
  function buildCredits() {
    var host = document.getElementById("fotokrediit");
    if (!host) return;
    var items = ALL.filter(function (it) { return creditText(it); });
    if (!items.length) { host.hidden = true; return; }
    host.hidden = false;
    host.textContent = "Fotod: ";
    items.forEach(function (it, i) {
      if (i) host.appendChild(document.createTextNode(" · "));
      var a = document.createElement(it.foto_allikas ? "a" : "span");
      a.textContent = it.nimi + " - " + it.foto_autor +
                      (it.foto_litsents ? ", " + it.foto_litsents : "");
      if (it.foto_allikas) {
        a.href = it.foto_allikas;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      host.appendChild(a);
    });
  }

  var main = document.getElementById("main");
  var doneEl = document.getElementById("done");
  var totalEl = document.getElementById("total");
  var barEl = document.getElementById("bar");
  var barFill = barEl.firstElementChild;
  var openEl = document.getElementById("openstat");

  var REGIONS = [];
  var ALL = [];            /* kõik read, kaasa arvatud endised tornid */
  var OFFICIAL = [];       /* ainult Transpordiameti nimekirja 55 tuletorni */
  var rowEls = {};
  var TOTAL = 0;
  var OPEN_TOTAL = 0;
  var filter = "all";
  var query = "";

  fetch(url("tuletornid.json"))
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      REGIONS = data.piirkonnad || [];
      REGIONS.forEach(function (g) {
        var ametlik = g.ametlik !== false;
        (g.tuletornid || []).forEach(function (it) {
          it.piirkond = g.nimi;
          it.ametlik = ametlik;
          ALL.push(it);
          if (ametlik) OFFICIAL.push(it);
        });
      });
      /* Loendur räägib ainult ametlikust nimekirjast; endised tornid on
         omaette sektsioon ja ei tohi koguarvu paisutada. */
      TOTAL = OFFICIAL.length;
      OPEN_TOTAL = OFFICIAL.filter(function (i) { return i.avatud; }).length;
      totalEl.textContent = TOTAL;
      barEl.setAttribute("aria-valuemax", TOTAL);
      build();
      buildMap();
      buildCredits();
      applyAll();
      refreshTotals();
      applyFilter();
      wireControls();
    })
    .catch(function () {
      var p = document.createElement("div");
      p.className = "empty";
      p.textContent =
        "Andmefaili tuletornid.json ei õnnestunud laadida. Kui avasid index.html " +
        "topeltklõpsuga, käivita kaustas kohalik server: python3 -m http.server";
      main.appendChild(p);
    });

  /* ---------- DOM ---------- */

  function build() {
    REGIONS.forEach(function (g) {
      var sec = document.createElement("section");
      sec.className = "region";

      var h2 = document.createElement("h2");
      var h2a = document.createElement("span");
      h2a.textContent = g.nimi;
      var rc = document.createElement("span");
      rc.className = "rc";
      h2.appendChild(h2a);
      h2.appendChild(rc);

      var intro = document.createElement("p");
      intro.textContent = g.tutvustus || "";

      var list = document.createElement("div");
      list.className = "list";

      (g.tuletornid || []).forEach(function (it) {
        list.appendChild(buildRow(it));
      });

      var emptyMsg = document.createElement("div");
      emptyMsg.className = "empty";
      emptyMsg.hidden = true;
      emptyMsg.textContent = "Selles piirkonnas ei vasta ükski torn filtrile.";
      list.appendChild(emptyMsg);

      sec.appendChild(h2);
      sec.appendChild(intro);
      sec.appendChild(list);
      main.appendChild(sec);

      g._sec = sec;
      g._rc = rc;
      g._empty = emptyMsg;
    });
  }

  function buildRow(it) {
    var row = document.createElement("div");
    row.className = "row";

    var lab = document.createElement("label");
    lab.className = "lh";

    var chk = document.createElement("input");
    chk.type = "checkbox";
    chk.id = "chk-" + it.id;
    lab.appendChild(chk);

    var tw = document.createElement("span");
    tw.className = "tower";
    var bar = document.createElement("i");
    bar.style.setProperty("--h", it.korgus_m || 10);
    tw.appendChild(bar);
    lab.appendChild(tw);

    var body = document.createElement("span");

    var hd = document.createElement("span");
    hd.className = "hd";
    var nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = it.nimi;
    hd.appendChild(nm);
    if (it.avatud) {
      var bOpen = document.createElement("span");
      bOpen.className = "badge b-open";
      bOpen.textContent = "Avatud";
      hd.appendChild(bOpen);
    } else if (it.ligipaas && BADGES[it.ligipaas]) {
      var bAcc = document.createElement("span");
      bAcc.className = "badge " + BADGES[it.ligipaas][0];
      bAcc.textContent = BADGES[it.ligipaas][1];
      hd.appendChild(bAcc);
    }
    body.appendChild(hd);

    /* Andmerida ehitatakse ainult olemasolevatest väljadest - tühja välja
       kohta ei kirjutata midagi ega tuletata. */
    var meta = document.createElement("span");
    meta.className = "meta";
    var bits = [];
    if (it.asukoht) bits.push(it.asukoht);
    if (it.aasta) bits.push(it.aasta + ".");
    if (it.korgus_m) bits.push("torn " + num(it.korgus_m) + " m");
    if (it.tulekorgus_m) bits.push("tuli " + num(it.tulekorgus_m) + " m üle mere");
    if (it.tuup && it.tuup !== "Tuletorn") bits.push(it.tuup.replace(/^Tuletorn,\s*/, ""));
    if (it.margi_nr) bits.push("nr " + it.margi_nr);
    meta.textContent = bits.join("  ·  ");
    body.appendChild(meta);

    var desc = document.createElement("span");
    desc.className = "desc";
    desc.textContent = it.kirjeldus;
    body.appendChild(desc);

    lab.appendChild(body);

    if (it.foto) {
      var img = document.createElement("img");
      img.className = "shot";
      img.src = url(it.foto);
      img.alt = it.nimi;
      img.loading = "lazy";
      var c = creditText(it);
      if (c) img.title = it.nimi + " - " + c;
      img.addEventListener("error", function () {
        /* Puuduv pilt ei tohi jätta katkist ikooni rea serva. */
        img.remove();
        if (window.console) console.warn("Fotot ei leitud:", img.src);
      });
      lab.appendChild(img);
    }
    row.appendChild(lab);

    var memo = document.createElement("div");
    memo.className = "memo";
    var ml = document.createElement("label");
    ml.textContent = "Märkmed";
    ml.setAttribute("for", "memo-" + it.id);
    var mi = document.createElement("input");
    mi.type = "text";
    mi.id = "memo-" + it.id;
    mi.placeholder = "Millal käisid, kellega, mis meelde jäi…";
    memo.appendChild(ml);
    memo.appendChild(mi);
    row.appendChild(memo);

    rowEls[it.id] = { row: row, chk: chk, memo: mi, item: it };

    chk.addEventListener("change", function () {
      if (chk.checked) {
        if (!state.visited[it.id]) state.visited[it.id] = { note: "" };
      } else {
        delete state.visited[it.id];
      }
      applyRow(it.id);
      refreshTotals();
      applyFilter();
      saveLocal();
    });

    mi.addEventListener("input", function () {
      if (state.visited[it.id]) {
        state.visited[it.id].note = mi.value.slice(0, 500);
        saveLocal();
      }
    });

    return row;
  }

  /* ---------- kaart ----------
     Markerid ehitatakse samast ALL massiivist, mis nimekiri - teist
     tornide loendit projektis ei ole. */

  var map = null;
  var markers = {};
  var mapCountEl = document.getElementById("mapcount");

  var STYLE_TODO = {
    radius: 6, weight: 2, color: "#1f6e92", fillColor: "#ffffff", fillOpacity: 1
  };
  var STYLE_DONE = {
    radius: 7, weight: 2, color: "#96222a", fillColor: "#c0323a", fillOpacity: 1
  };

  function markerStyle(it) {
    var base = state.visited[it.id] ? STYLE_DONE : STYLE_TODO;
    var s = {
      radius: base.radius, weight: base.weight, color: base.color,
      fillColor: base.fillColor, fillOpacity: base.fillOpacity
    };
    /* Avatud torn saab jämedama ringi - sama mõte mis nimekirja sildil. */
    if (it.avatud) {
      s.weight = 3;
      if (!state.visited[it.id]) s.color = "#c0323a";
    }
    return s;
  }

  function popupContent(it) {
    var box = document.createElement("div");
    box.className = "pop";

    if (it.foto) {
      var img = document.createElement("img");
      img.src = url(it.foto);
      img.alt = it.nimi;
      img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); });
      box.appendChild(img);
    }

    var nm = document.createElement("div");
    nm.className = "pop-nm";
    nm.textContent = it.nimi;
    box.appendChild(nm);

    var loc = document.createElement("span");
    loc.className = "pop-loc";
    var locBits = [];
    if (it.asukoht) locBits.push(it.asukoht);
    if (it.aasta) locBits.push(it.aasta + ".");
    if (!locBits.length && it.margi_nr) locBits.push("nr " + it.margi_nr);
    loc.textContent = locBits.join("  ·  ");
    box.appendChild(loc);

    var credit = creditText(it);
    if (credit) {
      var cr = document.createElement(it.foto_allikas ? "a" : "span");
      cr.className = "pop-credit";
      cr.textContent = credit;
      if (it.foto_allikas) {
        cr.href = it.foto_allikas;
        cr.target = "_blank";
        cr.rel = "noopener noreferrer";
      }
      box.appendChild(cr);
    }

    var st = document.createElement("span");
    var done = !!state.visited[it.id];
    st.className = "pop-state " + (done ? "is-done" : "is-todo");
    st.textContent = done ? "Käidud" : "Käimata";
    box.appendChild(st);

    return box;
  }

  function buildMap() {
    var host = document.getElementById("map");
    if (!host) return;

    if (typeof L === "undefined") {
      host.style.height = "auto";
      var note = document.createElement("p");
      note.className = "empty";
      note.textContent = "Kaardi teeki (Leaflet) ei õnnestunud laadida. Kontrolli internetiühendust - nimekiri töötab ka ilma kaardita.";
      host.appendChild(note);
      return;
    }

    map = L.map(host, {
      scrollWheelZoom: false,   /* et pika lehe kerimine kaardi kohal ei kinni jääks */
      zoomControl: true
    });
    map.on("click", function () { map.scrollWheelZoom.enable(); });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kaastöölised'
    }).addTo(map);

    var pts = [];
    ALL.forEach(function (it) {
      if (typeof it.lat !== "number" || typeof it.lng !== "number") return;
      var m = L.circleMarker([it.lat, it.lng], markerStyle(it));
      m.bindPopup(function () { return popupContent(it); }, {
        closeButton: true, autoPanPadding: [24, 24]
      });
      m.bindTooltip(it.nimi, { direction: "top", offset: [0, -6] });
      m.addTo(map);
      markers[it.id] = m;
      pts.push([it.lat, it.lng]);
    });

    if (pts.length) map.fitBounds(pts, { padding: [28, 28] });
    else map.setView([58.7, 24.5], 7);

    /* Kaart ehitatakse peidetud mõõtmetega konteinerisse harva, aga
       kindluse mõttes arvutame suuruse pärast paigutust üle. */
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  function refreshMarker(id) {
    var m = markers[id];
    if (!m) return;
    var it = rowEls[id] && rowEls[id].item;
    if (!it) return;
    m.setStyle(markerStyle(it));
    if (m.isPopupOpen && m.isPopupOpen()) m.setPopupContent(popupContent(it));
  }

  /* ---------- olek ---------- */

  function applyRow(id) {
    var r = rowEls[id];
    if (!r) return;
    var v = state.visited[id];
    r.row.classList.toggle("on", !!v);
    r.chk.checked = !!v;
    var note = v && v.note ? v.note : "";
    if (document.activeElement !== r.memo && r.memo.value !== note) r.memo.value = note;
    refreshMarker(id);
  }

  function applyAll() {
    ALL.forEach(function (it) { applyRow(it.id); });
  }

  function refreshTotals() {
    var n = 0, openN = 0;
    OFFICIAL.forEach(function (it) {
      if (state.visited[it.id]) { n++; if (it.avatud) openN++; }
    });
    doneEl.textContent = n;
    barEl.setAttribute("aria-valuenow", n);
    barFill.style.width = (TOTAL ? (n / TOTAL * 100) : 0) + "%";
    openEl.textContent = "Avatud tornidest: " + openN + " / " + OPEN_TOTAL;
    if (mapCountEl) mapCountEl.textContent = n + "/" + TOTAL;
    REGIONS.forEach(function (g) {
      var c = 0;
      (g.tuletornid || []).forEach(function (it) { if (state.visited[it.id]) c++; });
      g._rc.textContent = c + "/" + g.tuletornid.length;
    });
  }

  /* ---------- filter ---------- */

  function matches(it) {
    var v = !!state.visited[it.id];
    if (filter === "todo" && v) return false;
    if (filter === "done" && !v) return false;
    if (filter === "open" && !it.avatud) return false;
    if (query) {
      var hay = (it.nimi + " " + it.asukoht + " " + it.kirjeldus + " " + it.piirkond).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function applyFilter() {
    REGIONS.forEach(function (g) {
      var shown = 0;
      (g.tuletornid || []).forEach(function (it) {
        var ok = matches(it);
        rowEls[it.id].row.hidden = !ok;
        if (ok) shown++;
      });
      g._empty.hidden = shown > 0;
      g._sec.hidden = (shown === 0 && (query !== "" || filter !== "all"));
    });
  }

  function wireControls() {
    var chips = document.querySelectorAll(".chip");
    Array.prototype.forEach.call(chips, function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.dataset.f;
        Array.prototype.forEach.call(chips, function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        applyFilter();
      });
    });

    document.getElementById("q").addEventListener("input", function (e) {
      query = e.target.value.trim().toLowerCase();
      applyFilter();
    });

    document.getElementById("reset").addEventListener("click", function () {
      if (!Object.keys(state.visited).length) return;
      if (!window.confirm("Kustutan kõik linnukesed ja märkmed. Kas jätkan?")) return;
      state.visited = {};
      applyAll();
      refreshTotals();
      applyFilter();
      saveLocal();
    });
  }
})();
