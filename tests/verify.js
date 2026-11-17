/*
  Vérification de bout en bout du site Le Saraly.
  Lance : npm run verify   (Node.js, Playwright + Chromium requis ; npm install pour axe-core)
  Génère le site comme l'hébergeur (node build.js), le sert en local, ouvre chaque page
  comme un visiteur et vérifie :
   1. chaque page, ordinateur + mobile : aucune erreur JS, aucun fichier local manquant, pas de défilement horizontal
   2. le parcours : menu → chaque page, menu mobile, retour accueil, sélecteur de palette
   3. tous les liens internes répondent
   4. le contenu affiché correspond au référentiel tests/faits-verifies.json (prix, horaires, mots interdits)
   5. propriété : le badge « Ouvert / Fermé » est juste à toute heure de la semaine (336 instants testés)
   6. accessibilité WCAG 2 A/AA (axe-core, si installé : npm install), barre mobile, blocs vides masqués, SEO
   7. confort sur téléphone (320 px et 390 px) : pas de débordement, cibles tactiles ≥ 44 px, textes ≥ 12 px, pied de page visible
   8. site lisible sans JavaScript, aucune requête vers un tiers au chargement, carte Google au clic,
      fermetures exceptionnelles, données Google cohérentes, pages et fichiers annexes, mode « fichiers bruts »
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SRC = path.resolve(__dirname, "..");
const os = require("os");
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "saraly-dist-"));
require("child_process").execFileSync(process.execPath, [path.join(SRC, "build.js"), ROOT], { stdio: "inherit" });
const FAITS = JSON.parse(fs.readFileSync(path.join(__dirname, "faits-verifies.json"), "utf8"));
const PAGES = ["index", "carte", "le-saraly", "actus", "venir", "liens", "mentions-legales", "404"];
const NAV = { "carte.html": "carte", "le-saraly.html": "le-saraly", "actus.html": "actus", "venir.html": "venir" };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };

let fails = 0, passes = 0;
function check(ok, label, detail) {
  if (ok) { passes++; } else { fails++; console.log("  ✗ " + label + (detail ? " — " + detail : "")); }
}

function serve(dir = ROOT) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split("?")[0]);
      const f = path.join(dir, u === "/" ? "index.html" : u);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("404"); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
      fs.createReadStream(f).pipe(res);
    }).listen(0, "127.0.0.1", () => resolve(srv));
  });
}

async function openPage(browser, base, name, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [], missing = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.url().startsWith(base) && r.status() >= 400) missing.push(r.url().replace(base, "")); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort()); // pas de réseau externe : on teste notre code
  await page.goto(`${base}/${name}.html`, { waitUntil: "load" });
  await page.waitForTimeout(150);
  return { page, errors, missing };
}

(async () => {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();

  // 1. Chaque page, deux tailles d'écran
  console.log("1. Pages (ordinateur 1280px + mobile 390px)");
  for (const name of PAGES) {
    for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const { page, errors, missing } = await openPage(browser, base, name, vp);
      const tag = `${name} @${vp.width}`;
      check(errors.length === 0, `${tag} : aucune erreur JS`, errors.join(" | "));
      check(missing.length === 0, `${tag} : aucun fichier manquant`, missing.join(", "));
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      check(sw <= vp.width, `${tag} : pas de défilement horizontal`, `largeur ${sw}px`);
      if (!["liens", "mentions-legales"].includes(name)) {
        check(await page.locator("nav .nav-links a").count() === 4, `${tag} : menu à 4 liens`);
        check(await page.locator("footer.footer").count() === 1, `${tag} : pied de page présent`);
        check(await page.evaluate(() => !!document.getElementById("logo-badge")), `${tag} : logo chargé`);
      }
      await page.close();
    }
  }

  // 2. Parcours visiteur
  console.log("2. Parcours visiteur");
  {
    const { page } = await openPage(browser, base, "index", { width: 1280, height: 900 });
    for (const [href, name] of Object.entries(NAV)) {
      await page.locator(`nav .nav-links a[href="${href}"]`).click();
      await page.waitForURL(`**/${href}`);
      check(await page.locator(`nav .nav-links a[aria-current="page"][href="${href}"]`).count() === 1, `menu → ${name} : page ouverte et lien actif`);
    }
    await page.locator("a.nav-badge").click();
    await page.waitForURL("**/index.html");
    check(true, "logo → retour accueil");
    await page.locator('.demo-theme button[data-theme="rose"]').click();
    check(await page.evaluate(() => document.documentElement.getAttribute("data-theme")) === "rose", "palette : clic sur Rose poudré appliqué");
    await page.locator('.demo-theme button[data-theme="facade"]').click();
    check(await page.evaluate(() => document.documentElement.getAttribute("data-theme")) === null, "palette : retour à Façade");
    await page.close();

    const m = await openPage(browser, base, "index", { width: 390, height: 844 });
    check(!(await m.page.locator("#menu").isVisible()), "mobile : menu fermé au départ");
    await m.page.locator(".nav-toggle").click();
    check(await m.page.locator("#menu").isVisible(), "mobile : bouton Menu ouvre les liens");
    await m.page.locator('#menu a[href="venir.html"]').click();
    await m.page.waitForURL("**/venir.html");
    check(true, "mobile : lien du menu suivi");
    await m.page.close();
  }

  // 3. Liens internes
  console.log("3. Liens internes");
  {
    const hrefs = new Set();
    for (const name of PAGES) {
      const { page } = await openPage(browser, base, name, { width: 1280, height: 900 });
      for (const h of await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) {
        if (!/^(https?:|mailto:|tel:|#)/.test(h)) hrefs.add(h.split("#")[0]);
      }
      await page.close();
    }
    for (const h of hrefs) {
      const r = await fetch(`${base}/${h}`);
      check(r.status === 200, `lien « ${h} » répond`, `HTTP ${r.status}`);
    }
  }

  // 4. Contenu fidèle au référentiel
  console.log("4. Contenu comparé au référentiel tests/faits-verifies.json");
  {
    const texts = {};
    for (const name of PAGES) {
      const { page } = await openPage(browser, base, name, { width: 1280, height: 900 });
      // texte visible, hors logo (le badge officiel contient « Salon de thé »)
      texts[name] = await page.evaluate(() => {
        const c = document.body.cloneNode(true);
        c.querySelectorAll("svg, script, style").forEach((n) => n.remove());
        return c.innerText || c.textContent;
      });
      await page.close();
    }
    const all = Object.values(texts).join("\n");
    for (const mot of FAITS.interdits) {
      check(!all.toLowerCase().includes(mot.toLowerCase()), `aucune mention « ${mot} »`);
    }
    // chaque prix affiché à côté d'un nom doit correspondre au référentiel
    const { page } = await openPage(browser, base, "carte", { width: 1280, height: 900 });
    const rows = await page.$$eval(".row, .band-head", (els) => els.map((e) => ({
      nom: (e.querySelector(".name, h3") || {}).firstChild ? (e.querySelector(".name, h3").firstChild.textContent || "").trim() : "",
      prix: (e.querySelector(".price") || {}).textContent || null
    })));
    for (const r of rows) {
      if (r.prix) check(FAITS.prix[r.nom] === r.prix.trim(), `prix « ${r.nom} » = ${r.prix}`, `référentiel : ${FAITS.prix[r.nom] || "absent"}`);
    }
    const sansPrix = await page.$$eval(".menu-cat", (cats) => cats.filter((c) => c.querySelectorAll(".row").length > c.querySelectorAll(".row .price").length)
      .map((c) => !!c.querySelector(".cat-note")));
    check(sansPrix.every(Boolean), "catégories sans prix marquées « Prix à confirmer »");
    await page.close();
    const home = await openPage(browser, base, "index", { width: 1280, height: 900 });
    const plats = await home.page.$$eval(".plat", (els) => els.map((e) => ({ nom: e.querySelector(".plat-name").textContent.trim(), prix: e.querySelector(".plat-price").textContent.trim() })));
    check(plats.length >= 4, `accueil : ${plats.length} plats du brunch affichés`);
    for (const p of plats) check(FAITS.prix[p.nom] === p.prix, `accueil : prix « ${p.nom} » = ${p.prix}`, `référentiel : ${FAITS.prix[p.nom] || "absent"}`);
    await home.page.close();
    check(all.includes(FAITS.adresse), "adresse affichée");
    check(all.includes(FAITS.email), "e-mail affiché");
    const v = await openPage(browser, base, "venir", { width: 1280, height: 900 });
    const table = await v.page.$$eval("tbody[data-hours] tr", (trs) => trs.map((tr) => [tr.querySelector("th").textContent.toLowerCase(), tr.querySelector("td").textContent]));
    for (const [jour, txt] of table) {
      const h = FAITS.horaires[jour];
      const attendu = h ? `${parseInt(h[0])}h – ${parseInt(h[1])}h` : "Fermé";
      check(txt === attendu, `horaire ${jour} = ${txt}`, `attendu ${attendu}`);
    }
    await v.page.close();
  }

  // 5. Propriété : statut ouvert/fermé juste à tout moment
  console.log("5. Badge Ouvert / Fermé sur une semaine complète (toutes les 30 min)");
  {
    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const page = await browser.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    let wrong = [];
    // semaine du lundi 16 novembre 2026, heure de Paris (UTC+1 en hiver)
    for (let i = 0; i < 7 * 48; i++) {
      const t = new Date(Date.UTC(2026, 10, 16, 0, 0) - 3600e3 + i * 30 * 60e3);
      await page.clock.setFixedTime(t);
      await page.goto(`${base}/index.html`, { waitUntil: "load" });
      const label = await page.locator("#status .status-txt").textContent();
      const paris = new Date(t.getTime() + 3600e3);
      const jour = jours[paris.getUTCDay()], min = paris.getUTCHours() * 60 + paris.getUTCMinutes();
      const h = FAITS.horaires[jour];
      const ouvert = !!h && min >= +h[0].slice(0, 2) * 60 && min < +h[1].slice(0, 2) * 60;
      if (ouvert !== label.startsWith("Ouvert")) wrong.push(`${jour} ${Math.floor(min / 60)}h${min % 60 || ""} → « ${label} »`);
    }
    check(wrong.length === 0, "statut juste sur 336 instants", wrong.slice(0, 5).join(" ; "));
    await page.close();
  }

  // 6. Accessibilité, barre mobile, blocs vides, SEO
  console.log("6. Accessibilité (WCAG 2 A/AA), barre mobile, blocs vides, SEO");
  {
    let AXE = null;
    try { AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js", { paths: [SRC] }), "utf8"); }
    catch (e) { console.log("  (axe-core absent : lancer « npm install » pour le test d'accessibilité)"); }
    if (AXE) {
      for (const name of PAGES) {
        for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
          const { page } = await openPage(browser, base, name, vp);
          await page.addScriptTag({ content: AXE });
          const res = await page.evaluate(async () => await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } }));
          const v = res.violations.map((x) => `${x.id} (${x.nodes.length}) : ${x.nodes[0].target.join(" ")}`);
          check(v.length === 0, `${name} @${vp.width} : aucune violation WCAG A/AA`, v.join(" | "));
          await page.close();
        }
      }
    }
    const m = await openPage(browser, base, "index", { width: 390, height: 844 });
    check(await m.page.locator(".action-bar").isVisible(), "mobile : barre d'actions visible");
    const hrefs = await m.page.$$eval(".action-bar a", (as) => as.map((a) => a.getAttribute("href")));
    check(hrefs.includes("carte.html"), "mobile : barre d'actions → La carte");
    const tel = await m.page.evaluate(() => ((window.SARALY || {}).contact || {}).telephone || "");
    check(tel ? hrefs.some((h) => h.startsWith("tel:")) : !hrefs.some((h) => h.startsWith("tel:")), "mobile : bouton Appeler seulement si un téléphone est renseigné");
    await m.page.close();
    const d = await openPage(browser, base, "index", { width: 1280, height: 900 });
    check(!(await d.page.locator(".action-bar").isVisible()), "ordinateur : barre d'actions masquée");
    await d.page.close();
    const v = await openPage(browser, base, "venir", { width: 1280, height: 900 });
    const pr = await v.page.evaluate(() => ((window.SARALY || {}).pratique || []).length);
    check(await v.page.locator("[data-pratique-bloc]").isVisible() === pr > 0, "venir : bloc « Sur place » visible seulement s'il est renseigné");
    check(await v.page.locator("[data-telephone]").isVisible() === !!(await v.page.evaluate(() => ((window.SARALY || {}).contact || {}).telephone)), "venir : téléphone affiché seulement s'il est renseigné");
    await v.page.close();
    for (const f of ["robots.txt", "sitemap.xml"]) check((await fetch(`${base}/${f}`)).status === 200, `${f} présent`);
  }

  // 7. Confort sur téléphone
  console.log("7. Téléphone : 320 px et 390 px (débordement, cibles tactiles, tailles de texte, pied de page)");
  for (const vp of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
    for (const name of PAGES) {
      const { page } = await openPage(browser, base, name, vp);
      const r = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const vis = (el) => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 1 && b.height > 1; };
        const small = [], tiny = [];
        for (const el of document.querySelectorAll("a, button")) {
          if (!vis(el) || el.closest(".demo-theme") || el.classList.contains("skip")) continue; // la palette de démo sera retirée
          const b = el.getBoundingClientRect();
          const inline = getComputedStyle(el).display === "inline" && el.closest("p, td, li") && !el.closest("nav");
          if (!inline && (b.height < 44 || b.width < 44)) small.push(`${el.textContent.trim().slice(0, 25)} ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
        for (const el of document.querySelectorAll("p, span, a, li, td, th, h3, button, strong")) {
          if (!vis(el) || el.closest("svg")) continue;
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (own && parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(`${el.textContent.trim().slice(0, 25)} ${getComputedStyle(el).fontSize}`);
        }
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
        const bar = document.querySelector(".action-bar"), demo = document.querySelector(".demo-theme");
        const last = [...document.querySelectorAll("footer p, footer a, footer span")].filter(vis).pop();
        let hidden = false;
        if (last) for (const f of [bar, demo]) if (f && vis(f) && last.getBoundingClientRect().bottom > f.getBoundingClientRect().top + 1) hidden = true;
        return { sw: document.documentElement.scrollWidth, W, small, tiny, hidden };
      });
      const tag = `${name} @${vp.width}`;
      check(r.sw <= r.W, `${tag} : pas de débordement horizontal`, `${r.sw}px`);
      check(r.small.length === 0, `${tag} : cibles tactiles ≥ 44 px`, r.small.slice(0, 4).join(" ; "));
      check(r.tiny.length === 0, `${tag} : textes ≥ 12 px`, r.tiny.slice(0, 4).join(" ; "));
      check(!r.hidden, `${tag} : fin du pied de page visible au-dessus des éléments fixes`);
      await page.close();
    }
  }

  // 8. Robustesse, vie privée, cohérence
  console.log("8. Sans JavaScript, aucun tiers au chargement, carte au clic, fermetures, données Google, annexes");
  {
    // a. sans JavaScript, le contenu est déjà dans les pages
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    for (const [name, minPrix] of [["carte", 10], ["index", 5]]) {
      const pg = await nojs.newPage();
      await pg.goto(`${base}/${name}.html`);
      const r = await pg.evaluate(() => ({ prix: (document.body.innerText.match(/\d+,\d{2} €/g) || []).length, nav: document.querySelectorAll("nav .nav-links a").length, footer: !!document.querySelector("footer.footer"), logo: !!document.getElementById("logo-line") }));
      check(r.prix >= minPrix, `sans JavaScript, ${name} : ${r.prix} prix visibles`);
      check(r.nav === 4 && r.footer && r.logo, `sans JavaScript, ${name} : menu, pied de page et logo présents`);
      await pg.close();
    }
    const pgv = await nojs.newPage(); await pgv.goto(`${base}/venir.html`);
    check(await pgv.locator("tbody[data-hours] tr").count() === 7, "sans JavaScript, venir : tableau des horaires présent");
    await nojs.close();

    // b. aucune requête vers un autre site au chargement (polices locales, carte Google non chargée)
    for (const name of ["index", "venir", "carte"]) {
      const pg = await browser.newPage(); const ext = [];
      pg.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:")) ext.push(new URL(r.url()).host); });
      await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
      await pg.goto(`${base}/${name}.html`, { waitUntil: "load" });
      await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(300);
      check(ext.length === 0, `${name} : aucune requête vers un tiers au chargement`, [...new Set(ext)].join(", "));
      const fonts = await pg.evaluate(async () => { await document.fonts.ready; return ["Josefin Sans", "Instrument Sans", "Kaushan Script"].map((f) => document.fonts.check(`16px "${f}"`)); });
      check(fonts.every(Boolean), `${name} : les 3 polices locales sont chargées`);
      await pg.close();
    }

    // c. la carte Google ne se charge qu'au clic
    {
      const pg = await browser.newPage(); const g = [];
      pg.on("request", (r) => { if (/google\./.test(r.url())) g.push(r.url()); });
      await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
      await pg.goto(`${base}/venir.html`);
      check(await pg.locator("[data-map] iframe").count() === 0 && g.length === 0, "venir : pas de carte Google avant le clic");
      await pg.locator("[data-map-load]").click(); await pg.waitForTimeout(200);
      check(await pg.locator("[data-map] iframe").count() === 1, "venir : carte Google affichée après le clic");
      await pg.close();
    }

    // d. fermeture exceptionnelle : le badge et la page Venir en tiennent compte
    {
      const pg = await browser.newPage();
      await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
      await pg.route("**/contenu.js", async (route) => {
        const res = await route.fetch(); const body = (await res.text()) + '\nwindow.SARALY.fermetures = [{ du: "2026-11-18", au: "2026-11-19", motif: "Test" }];';
        await route.fulfill({ response: res, body });
      });
      await pg.clock.setFixedTime(new Date("2026-11-18T09:00:00Z")); // mercredi 10h à Paris, normalement ouvert
      await pg.goto(`${base}/venir.html`);
      const st = await pg.locator("#status .status-txt").textContent();
      check(st.startsWith("Fermé exceptionnellement") && /vendredi 9h/.test(st), "fermeture exceptionnelle : badge « Fermé exceptionnellement · ouvre vendredi 9h »", st);
      check(await pg.locator("[data-fermetures-bloc]").isVisible(), "fermeture exceptionnelle : annoncée sur la page Venir");
      await pg.close();
    }

    // e. données Google et pied de page cohérents avec les horaires du référentiel
    {
      const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      const EN = { Monday: "lundi", Tuesday: "mardi", Wednesday: "mercredi", Thursday: "jeudi", Friday: "vendredi", Saturday: "samedi", Sunday: "dimanche" };
      const fromLd = {}; for (const spec of ld.openingHoursSpecification) for (const d of [].concat(spec.dayOfWeek)) fromLd[EN[d]] = [spec.opens, spec.closes];
      const ok = Object.entries(FAITS.horaires).every(([j, h]) => JSON.stringify(h) === JSON.stringify(fromLd[j] || null));
      check(ok, "données Google : horaires identiques au référentiel", JSON.stringify(fromLd));
      const { page } = await openPage(browser, base, "index", { width: 1280, height: 900 });
      const foot = await page.locator(".footer-info p").nth(1).textContent();
      check(foot === "Mer–Sam 9h–17h · Dim 9h–15h", `pied de page : horaires « ${foot} »`);
      await page.close();
    }

    // f. fichiers annexes
    for (const f of ["404.html", "assets/img/apple-touch-icon.png", "assets/fonts/josefin-sans-latin-700-normal.woff2", "assets/fonts/LICENSE-josefin-sans.txt"]) {
      check((await fetch(`${base}/${f}`)).status === 200, `${f} présent`);
    }

    // g. les fichiers bruts (sans build) restent utilisables : JavaScript affiche le contenu
    {
      const raw = await serve(SRC); const rbase = `http://127.0.0.1:${raw.address().port}`;
      const pg = await browser.newPage(); const errors = [];
      pg.on("pageerror", (e) => errors.push(e.message));
      await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
      await pg.goto(`${rbase}/index.html`); await pg.waitForTimeout(200);
      const r = await pg.evaluate(() => ({ plats: document.querySelectorAll(".plat").length, nav: document.querySelectorAll("nav .nav-links a").length }));
      check(errors.length === 0 && r.plats >= 4 && r.nav === 4, "fichiers bruts : le contenu s'affiche par JavaScript", errors.join(" | "));
      await pg.close(); raw.close();
    }
  }

  await browser.close();
  srv.close();
  fs.rmSync(ROOT, { recursive: true, force: true });
  console.log(`\n${passes} vérifications OK, ${fails} en échec`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
