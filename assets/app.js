/* Affiche le contenu de contenu.js dans les pages + petits comportements */
(function () {
  var data = window.SARALY || {};
  var horaires = data.horaires || {};
  var jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var ordre = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  function fmt(h) { var p = h.split(":"); return parseInt(p[0], 10) + "h" + (p[1] === "00" ? "" : p[1]); }
  function minutes(h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // ---- Jour et heure à Sorgues ----
  var now = new Date(), today, nowMin;
  try {
    var parts = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    today = get("weekday"); nowMin = +get("hour") * 60 + +get("minute");
  } catch (e) {
    today = jours[now.getDay()]; nowMin = now.getHours() * 60 + now.getMinutes();
  }

  // ---- Tableau des horaires ----
  each("[data-hours]", function (tbody) {
    tbody.innerHTML = ordre.map(function (j) {
      var h = horaires[j];
      var cls = ((j === today ? "today " : "") + (h ? "" : "closed-day")).trim();
      return '<tr class="' + cls + '"><th scope="row">' + j.charAt(0).toUpperCase() + j.slice(1) +
        "</th><td>" + (h ? fmt(h[0]) + " – " + fmt(h[1]) : "Fermé") + "</td></tr>";
    }).join("");
  });

  // ---- Statut ouvert / fermé ----
  var status = document.getElementById("status");
  if (status) {
    var txt = status.querySelector(".status-txt"), h = horaires[today];
    if (h && nowMin >= minutes(h[0]) && nowMin < minutes(h[1])) {
      status.classList.add("open"); txt.textContent = "Ouvert jusqu’à " + fmt(h[1]);
    } else {
      status.classList.add("closed");
      var idx = ordre.indexOf(today), label = "";
      if (h && nowMin < minutes(h[0])) label = "Ouvre à " + fmt(h[0]);
      else for (var i = 1; i <= 7; i++) {
        var j = ordre[(idx + i) % 7], hh = horaires[j];
        if (hh) { label = "Fermé · ouvre " + (i === 1 ? "demain" : j) + " " + fmt(hh[0]); break; }
      }
      txt.textContent = label || "Fermé";
    }
  }

  // ---- Formules du matin ----
  each("[data-matin]", function (el) {
    var m = data.matin || { formules: [] };
    el.innerHTML = '<div class="band-title"><p class="label">Le matin</p><h2>' + esc(m.horaire).replace(" à ", "<br>à ") + "</h2></div>" +
      m.formules.map(function (f) {
        return '<article><div class="band-head"><h3>' + esc(f.nom) + '</h3><span class="price">' + esc(f.prix) +
          "</span></div><p>" + esc(f.desc) + "</p></article>";
      }).join("");
  });

  // ---- Carte ----
  function item(it) {
    return '<li><div class="row"><span class="name">' + esc(it.nom) + (it.tag ? ' <span class="tag">' + esc(it.tag) + "</span>" : "") +
      "</span>" + (it.prix ? '<span class="leader"></span><span class="price">' + esc(it.prix) + "</span>" : "") + "</div>" +
      (it.desc ? "<p>" + esc(it.desc) + "</p>" : "") + "</li>";
  }
  each("[data-carte]", function (el) {
    var seulAccueil = el.getAttribute("data-carte") === "accueil";
    var cats = (data.carte || []).filter(function (c) { return !seulAccueil || c.accueil; });
    el.innerHTML = cats.map(function (c) {
      return '<div class="menu-cat"><div class="cat-head"><h3>' + esc(c.titre) + '</h3><span class="label">' + esc(c.label) +
        '</span></div><ul class="items">' + c.items.map(item).join("") + "</ul>" +
        (c.items.some(function (it) { return !it.prix; }) ? '<p class="cat-note">Prix à confirmer</p>' : "") + "</div>";
    }).join("");
  });
  each("[data-formules]", function (el) {
    el.innerHTML = (data.formules || []).map(function (f) {
      return '<div class="extra"><p class="label">' + esc(f.label) + "</p><h3>" + esc(f.titre) + "</h3>" +
        (f.items ? '<ul class="items">' + f.items.map(item).join("") + "</ul>" : "") +
        (f.texte ? '<p class="extra-txt">' + esc(f.texte) + "</p>" : "") + "</div>";
    }).join("");
  });

  // ---- Actus ----
  each("[data-actus]", function (el) {
    var limit = parseInt(el.getAttribute("data-actus"), 10) || 99;
    el.innerHTML = (data.actus || []).slice(0, limit).map(function (a) {
      var d = a.date ? new Date(a.date + "T12:00:00") : null;
      var dateTxt = d && !isNaN(d) ? " · " + d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "";
      var af = a.affiche || {};
      var ph = '<div class="ph"><span class="ph-kicker">' + esc(af.kicker || "Le Saraly") + '</span><span class="ph-title">' +
        esc(af.titre || a.titre) + "</span>" + (af.script ? '<span class="ph-script">' + esc(af.script) + "</span>" : "") + "</div>";
      var img = a.image ? '<img src="' + esc(a.image) + '" alt="" loading="lazy" onerror="this.remove()">' : "";
      return '<article class="actu"><div class="actu-visual">' + ph + img + '</div><div class="actu-body"><p class="actu-meta label">' +
        esc(a.type) + dateTxt + "</p><h3>" + esc(a.titre) + "</h3><p>" + esc(a.texte) + "</p></div></article>";
    }).join("");
  });

  // ---- Téléphone et infos pratiques (affichés seulement si renseignés) ----
  var contact = data.contact || {};
  each("[data-telephone]", function (el) {
    if (!contact.telephone) return;
    el.innerHTML = 'Téléphone : <a href="tel:' + esc(contact.telephone.replace(/\s/g, "")) + '">' + esc(contact.telephone) + "</a>";
    el.hidden = false;
  });
  var pratique = data.pratique || [];
  each("[data-pratique]", function (el) {
    if (!pratique.length) return;
    el.innerHTML = pratique.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
  });
  each("[data-pratique-bloc]", function (el) { el.hidden = !pratique.length; });

  // ---- Menu mobile ----
  var toggle = document.querySelector(".nav-toggle"), links = document.getElementById("menu");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", open);
    });
  }

  var y = document.getElementById("year"); if (y) y.textContent = now.getFullYear();

  // ---- Palette de démo (présentation client uniquement) ----
  var themes = ["facade", "rose", "soleil", "creme"];
  function setTheme(t) {
    if (t === "facade") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    each(".demo-theme button", function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-theme") === t); });
    try { localStorage.setItem("saraly-theme", t); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("saraly-theme"); } catch (e) {}
  var q = null; try { q = new URLSearchParams(location.search).get("palette"); } catch (e) {}
  var t0 = q || saved;
  if (themes.indexOf(t0) > -1) setTheme(t0);
  each(".demo-theme button", function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme")); });
  });
})();
