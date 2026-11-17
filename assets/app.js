(function () {
  var data = window.SARALY || { horaires: {}, actus: [] };
  var jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var ordre = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  function fmt(h) { // "07:30" -> "7h30"
    var p = h.split(":"); return parseInt(p[0], 10) + "h" + (p[1] === "00" ? "" : p[1]);
  }
  function minutes(h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---- Horaires + statut "ouvert / fermé" (heure de Paris) ----
  var now = new Date();
  try {
    var parts = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var today = get("weekday"), nowMin = +get("hour") * 60 + +get("minute");
  } catch (e) {
    today = jours[now.getDay()]; nowMin = now.getHours() * 60 + now.getMinutes();
  }

  var tbody = document.getElementById("hours");
  if (tbody) {
    tbody.innerHTML = ordre.map(function (j) {
      var h = data.horaires[j];
      return '<tr' + (j === today ? ' class="today"' : '') + '><th scope="row">' + j.charAt(0).toUpperCase() + j.slice(1) +
        '</th><td>' + (h ? fmt(h[0]) + " – " + fmt(h[1]) : "Fermé") + "</td></tr>";
    }).join("");
  }

  var status = document.getElementById("status");
  if (status) {
    var txt = status.querySelector(".status-txt");
    var h = data.horaires[today];
    if (h && nowMin >= minutes(h[0]) && nowMin < minutes(h[1])) {
      status.classList.add("open"); txt.textContent = "Ouvert jusqu’à " + fmt(h[1]);
    } else {
      status.classList.add("closed");
      var idx = ordre.indexOf(today), label = "";
      if (h && nowMin < minutes(h[0])) label = "Ouvre à " + fmt(h[0]);
      else for (var i = 1; i <= 7; i++) {
        var j = ordre[(idx + i) % 7], hh = data.horaires[j];
        if (hh) { label = "Fermé · ouvre " + (i === 1 ? "demain" : j) + " " + fmt(hh[0]); break; }
      }
      txt.textContent = label || "Fermé";
    }
  }

  // ---- Actus ----
  var list = document.getElementById("actus-list");
  if (list) {
    list.innerHTML = (data.actus || []).slice(0, 6).map(function (a) {
      var d = new Date(a.date + "T12:00:00");
      var dateTxt = isNaN(d) ? "" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      var img = a.image ? '<img src="' + esc(a.image) + '" alt="" loading="lazy" onerror="this.remove()">' : "";
      return '<article class="actu"><div class="actu-visual"><div class="ph">' + esc(a.visuel || a.titre) + "</div>" + img +
        '</div><div class="actu-body"><p class="actu-meta mono"><span>' + esc(a.type) + "</span><span>" + dateTxt +
        "</span></p><h3>" + esc(a.titre) + "</h3><p>" + esc(a.texte) + "</p></div></article>";
    }).join("");
  }

  // ---- Menu mobile ----
  var toggle = document.querySelector(".nav-toggle"), links = document.getElementById("menu");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", false); } });
  }

  var y = document.getElementById("year"); if (y) y.textContent = now.getFullYear();

  // ---- Palette de démo (présentation client uniquement) ----
  function setTheme(t) {
    if (t === "brique") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll(".demo-theme button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.theme === t); });
    try { localStorage.setItem("saraly-theme", t); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("saraly-theme"); } catch (e) {}
  var q = new URLSearchParams(location.search).get("palette");
  if (q || saved) setTheme(q || saved);
  document.querySelectorAll(".demo-theme button").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.dataset.theme); });
  });
})();
