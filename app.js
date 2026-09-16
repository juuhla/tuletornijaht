/* Eesti tuletornijaht — nimekirja loogika.
   Andmed tulevad failist tuletornid.json, linnukesed elavad brauseri
   localStorage'is. Serverit ega sisselogimist ei ole. */
(function () {
  "use strict";

  var LS = "tuletornijaht.v2";
  var BADGES = { paat: ["b-boat", "Ainult paadiga"], jalgsi: ["b-walk", "Matkarada"] };

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

  var main = document.getElementById("main");
  var doneEl = document.getElementById("done");
  var totalEl = document.getElementById("total");
  var barEl = document.getElementById("bar");
  var barFill = barEl.firstElementChild;
  var openEl = document.getElementById("openstat");

  var REGIONS = [];
  var ALL = [];
  var rowEls = {};
  var TOTAL = 0;
  var OPEN_TOTAL = 0;
  var filter = "all";
  var query = "";

  fetch("tuletornid.json")
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      REGIONS = data.piirkonnad || [];
      REGIONS.forEach(function (g) {
        (g.tuletornid || []).forEach(function (it) {
          it.piirkond = g.nimi;
          ALL.push(it);
        });
      });
      TOTAL = ALL.length;
      OPEN_TOTAL = ALL.filter(function (i) { return i.avatud; }).length;
      totalEl.textContent = TOTAL;
      barEl.setAttribute("aria-valuemax", TOTAL);
      build();
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

    var meta = document.createElement("span");
    meta.className = "meta";
    var bits = [it.asukoht, it.aasta + ".", "torn " + num(it.korgus_m) + " m"];
    if (it.tulekorgus_m) bits.push("tuli " + num(it.tulekorgus_m) + " m üle mere");
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
      img.src = it.foto;
      img.alt = it.nimi;
      img.loading = "lazy";
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

  /* ---------- olek ---------- */

  function applyRow(id) {
    var r = rowEls[id];
    if (!r) return;
    var v = state.visited[id];
    r.row.classList.toggle("on", !!v);
    r.chk.checked = !!v;
    var note = v && v.note ? v.note : "";
    if (document.activeElement !== r.memo && r.memo.value !== note) r.memo.value = note;
  }

  function applyAll() {
    ALL.forEach(function (it) { applyRow(it.id); });
  }

  function refreshTotals() {
    var n = 0, openN = 0;
    ALL.forEach(function (it) {
      if (state.visited[it.id]) { n++; if (it.avatud) openN++; }
    });
    doneEl.textContent = n;
    barEl.setAttribute("aria-valuenow", n);
    barFill.style.width = (TOTAL ? (n / TOTAL * 100) : 0) + "%";
    openEl.textContent = "Avatud tornidest: " + openN + " / " + OPEN_TOTAL;
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
