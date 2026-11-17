#!/usr/bin/env node
/*
  Génère le dossier dist/ : les pages du site avec le contenu de contenu.js
  déjà écrit dans le HTML (carte, prix, horaires, actus, menu, pied de page).
  Les pages restent ainsi lisibles sans JavaScript et par tous les moteurs de recherche.

  Lancé automatiquement par l'hébergeur à chaque mise à jour :
    commande de build : node build.js      dossier publié : dist
  Aucune dépendance : seulement Node.js.
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "dist"));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "contenu.js"), "utf8"), ctx, { filename: "contenu.js" });
const data = ctx.window.SARALY;
if (!data) throw new Error("contenu.js ne définit pas window.SARALY");
const R = require("./assets/render.js").use(data);

// Remplit un élément vide portant l'attribut donné
function fill(html, attr, content) {
  const re = new RegExp("(<(\\w+)\\b[^>]*\\s" + attr + '(?:="([^"]*)")?[^>]*>)\\s*(</\\2>)', "g");
  return html.replace(re, (m, open, tag, value, close) => {
    const inner = typeof content === "function" ? content(open, value) : content;
    if (inner && /\shidden(?=[\s>])/.test(open)) open = open.replace(/\shidden(?=[\s>])/, "");
    return open + inner + close;
  });
}

function build(html) {
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1] || "accueil";
  if (html.includes("data-nav")) {
    html = html.replace(/(<body[^>]*>)/, "$1\n" + R.DEFS);
    html = html.replace(/<div data-nav><\/div>/, R.nav(page));
  }
  if (html.includes("<div data-footer></div>")) {
    html = html.replace("<div data-footer></div>", R.footer(data));
    html = html.replace(/(\s*<script src="contenu\.js"><\/script>)/, "\n  " + R.actions(data) + "$1");
  }
  html = fill(html, "data-matin", R.matin(data));
  html = fill(html, "data-carte", (open) => R.carte(data, /data-avec-matin/.test(open)));
  html = fill(html, "data-plats", R.plats(data));
  html = fill(html, "data-formules", R.formules(data));
  html = fill(html, "data-actus", (open, v) => R.actus(data, parseInt(v, 10) || 99));
  html = fill(html, "data-hours", R.hours(data, null));
  html = fill(html, "data-pratique", R.pratique(data));
  html = fill(html, "data-telephone", R.telephone(data));
  html = fill(html, "data-resume-horaires", R.resumeHorairesHtml(data));
  if ((data.pratique || []).length) html = html.replace(/(<[^>]*data-pratique-bloc)\s+hidden/, "$1");
  html = html.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (m, a, b) => a + "\n" + R.jsonld(data) + "\n  " + b);
  return html;
}

function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dst, f));
  } else fs.copyFileSync(src, dst);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of ["assets", "contenu.js", "robots.txt", "sitemap.xml"]) if (fs.existsSync(path.join(ROOT, f))) copy(path.join(ROOT, f), path.join(OUT, f));
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
for (const f of pages) fs.writeFileSync(path.join(OUT, f), build(fs.readFileSync(path.join(ROOT, f), "utf8")));
console.log(`Site généré dans ${path.relative(process.cwd(), OUT) || "."} : ${pages.length} pages`);
