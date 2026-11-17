/* Comportements du site Le Saraly.
   Si la page a été générée par build.js, le contenu est déjà dans le HTML :
   ce script ne fait alors que la partie qui dépend de l'heure (statut, jour du jour)
   et les interactions. Sinon (fichiers ouverts tels quels), il affiche aussi le contenu. */
(function () {
  var data = window.SARALY || {};
  var R = window.SaralyRender.use(data);
  var ORDRE = R.ORDRE;
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  var page = document.body.getAttribute("data-page") || "accueil";

  // ---- Mise en page (seulement si build.js ne l'a pas déjà écrite) ----
  if (!document.getElementById("logo-badge")) document.body.insertAdjacentHTML("afterbegin", R.DEFS);
  var navPh = document.querySelector("[data-nav]"); if (navPh) navPh.outerHTML = R.nav(page);
  var footPh = document.querySelector("[data-footer]"); if (footPh) footPh.outerHTML = R.footer(data);
  if (document.querySelector(".footer") && !document.querySelector(".action-bar")) document.body.insertAdjacentHTML("beforeend", R.actions(data));

  function fill(sel, html) { each(sel, function (el) { if (!el.innerHTML.trim()) el.innerHTML = html(el); }); }
  fill("[data-matin]", function () { return R.matin(data); });
  fill("[data-carte]", function (el) { return R.carte(data, el.hasAttribute("data-avec-matin")); });
  fill("[data-plats]", function () { return R.plats(data); });
  fill("[data-formules]", function () { return R.formules(data); });
  fill("[data-actus]", function (el) { return R.actus(data, parseInt(el.getAttribute("data-actus"), 10) || 99); });
  fill("[data-pratique]", function () { return R.pratique(data); });
  fill("[data-telephone]", function () { return R.telephone(data); });
  fill("[data-resume-horaires]", function () { return R.resumeHorairesHtml(data); });
  each("[data-telephone]", function (el) { el.hidden = !el.innerHTML.trim(); });
  each("[data-pratique-bloc]", function (el) { el.hidden = !(data.pratique || []).length; });

  // ---- Jour et heure à Sorgues ----
  var now = new Date(), today, nowMin, iso;
  try {
    var parts = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    today = get("weekday"); nowMin = +get("hour") * 60 + +get("minute"); iso = get("year") + "-" + get("month") + "-" + get("day");
  } catch (e) {
    today = ORDRE[(now.getDay() + 6) % 7]; nowMin = now.getHours() * 60 + now.getMinutes(); iso = now.toISOString().slice(0, 10);
  }
  function minutes(h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; }
  function isoPlus(n) { var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function jourDe(isoDate) { return ORDRE[(new Date(isoDate + "T12:00:00Z").getUTCDay() + 6) % 7]; }
  function fermeLe(isoDate) {
    return (data.fermetures || []).filter(function (f) { return isoDate >= f.du && isoDate <= (f.au || f.du); })[0];
  }

  each("[data-hours]", function (tb) { tb.innerHTML = R.hours(data, today); });
  each("[data-fermetures]", function (ul) { ul.innerHTML = R.fermetures(data, iso); });
  each("[data-fermetures-bloc]", function (el) { el.hidden = !R.fermeturesAVenir(data, iso).length; });

  // ---- Statut ouvert / fermé (horaires + fermetures exceptionnelles) ----
  var status = document.getElementById("status");
  if (status) {
    var txt = status.querySelector(".status-txt"), h = data.horaires && data.horaires[today], exc = fermeLe(iso);
    if (!exc && h && nowMin >= minutes(h[0]) && nowMin < minutes(h[1])) {
      status.classList.add("open"); txt.textContent = "Ouvert jusqu’à " + R.fmt(h[1]);
    } else {
      status.classList.add("closed");
      if (!exc && h && nowMin < minutes(h[0])) {
        txt.textContent = "Ouvre à " + R.fmt(h[0]);
      } else {
        var suite = "";
        for (var i = 1; i <= 21; i++) {
          var d = isoPlus(i), hh = data.horaires && data.horaires[jourDe(d)];
          if (hh && !fermeLe(d)) { suite = " · ouvre " + (i === 1 ? "demain" : jourDe(d) + (i > 6 ? " " + +d.slice(8) : "")) + " " + R.fmt(hh[0]); break; }
        }
        txt.textContent = (exc ? "Fermé exceptionnellement" : "Fermé") + suite;
      }
    }
  }

  // ---- Menu mobile ----
  var toggle = document.querySelector(".nav-toggle"), links = document.getElementById("menu");
  if (toggle && links) toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", links.classList.toggle("open")); });

  var y = document.getElementById("year"); if (y) y.textContent = now.getFullYear();

  // ---- Carte Google : chargée seulement au clic (pas de cookie Google avant) ----
  each("[data-map-load]", function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest("[data-map]");
      box.innerHTML = '<iframe title="Plan d’accès Le Saraly" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=157+cours+de+la+R%C3%A9publique,+84700+Sorgues&amp;output=embed"></iframe>';
      box.classList.add("map-loaded");
    });
  });

  // ---- Palette de démo (présentation au client uniquement : à retirer ensuite) ----
  var themes = [["facade", "Façade"], ["rose", "Rose poudré"], ["soleil", "Soleil"], ["creme", "Crème"]];
  document.body.insertAdjacentHTML("beforeend", '<div class="demo-theme"><button class="demo-toggle label" type="button" aria-expanded="false" aria-controls="demo-swatches">Palette</button>' +
    '<div class="demo-swatches" id="demo-swatches" role="group" aria-label="Palette de démonstration">' +
    themes.map(function (t) { return '<button type="button" data-theme="' + t[0] + '" aria-pressed="false" aria-label="' + t[1] + '" title="' + t[1] + '"></button>'; }).join("") + "</div></div>");
  document.body.classList.add("with-demo");
  var demo = document.querySelector(".demo-theme"), demoBtn = demo.querySelector(".demo-toggle");
  demoBtn.addEventListener("click", function () { var o = demo.classList.toggle("open"); demoBtn.setAttribute("aria-expanded", o); });
  function setTheme(t) {
    if (t === "facade") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t);
    each(".demo-theme [data-theme]", function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-theme") === t); });
    try { localStorage.setItem("saraly-theme", t); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("saraly-theme"); } catch (e) {}
  var q = null; try { q = new URLSearchParams(location.search).get("palette"); } catch (e) {}
  var t0 = q || saved || "facade";
  setTheme(themes.some(function (t) { return t[0] === t0; }) ? t0 : "facade");
  each(".demo-theme [data-theme]", function (b) { b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme")); }); });
})();
