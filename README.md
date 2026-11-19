# Le Saraly — site vitrine

Site vitrine du **Saraly**, brunch et coffee shop au 157 cours de la République, 84700 Sorgues.
Site statique en HTML, CSS et JS, sans CMS ni base de données. `node build.js` génère le dossier `dist/` : les pages avec le contenu de `contenu.js` déjà écrit dedans (lisibles sans JavaScript, meilleures pour Google). Ouvrir `index.html` directement marche aussi : le JavaScript affiche alors le contenu.

```
index.html             accueil centré sur le brunch : formules du matin, plats en cartes illustrées, goûter, actus, accès
carte.html             la carte complète : formules du matin, brunch, cafés, boissons, goûter, P'tit Saraly
le-saraly.html         le Saraly en quatre points illustrés
actus.html             toutes les actus
venir.html             horaires, adresse, contact, plan
liens.html             page « lien en bio » pour Instagram (remplace Linktree)
mentions-legales.html  obligatoire en France (champs jaunes à compléter)
contenu.js             horaires, carte, formules, actus, contact, infos pratiques : le seul fichier à modifier au quotidien
build.js               génère dist/ (lancé par l'hébergeur à chaque mise à jour)
assets/render.js       affichage partagé navigateur / build : logo, illustrations, menu, pied de page, carte
assets/app.js          statut ouvert/fermé, fermetures, carte Google au clic, menu mobile
assets/fonts/          polices hébergées sur le site (licence SIL OFL)
assets/style.css       styles (les couleurs de la DA sont en haut du fichier)
assets/img/            favicon et og.png (aperçu lors d'un partage de lien)
assets/visuels/        visuels des actus (carrés, comme sur Instagram)
robots.txt, sitemap.xml référencement
tests/                 vérification de bout en bout (voir plus bas)
```

La carte, les horaires et les actus sont saisis une seule fois dans `contenu.js` et s'affichent sur toutes les pages.

## Direction artistique (relevée sur leurs réseaux)

- **Logo** : reconstitué en SVG dans `assets/render.js` (`#g-le`, `#g-saraly`, badge `#logo-badge`). Il reprend le S en blocs, les A pointés, le E à losange, le R anguleux, le soleil et le Y à point. **Demander le fichier officiel** (SVG ou PNG HD) pour vérifier ou remplacer.
- **Couleurs** : terracotta de la façade, rouille du logo sur crème, rose poudré, jaune soleil. La terracotta du haut de page est légèrement assombrie (#B5492B) et les petits textes rouille utilisent une rouille foncée (#96492A), pour respecter le contraste WCAG AA. Le sélecteur de démo propose 4 palettes : Façade, Rose poudré, Soleil, Crème.
- **Typos** : Josefin Sans (géométrique, proche du logo), Kaushan Script (rappelle les menus manuscrits), Instrument Sans (texte courant).
- **Illustrations** : 8 dessins vectoriels dans `assets/render.js` (chakchouka, bénédictes, avocado toast, velouté, latte, baghrir et amlou, pancakes, et un motif soleil pour « Le jardin d'Éden », dont la composition n'est pas connue). À remplacer par leurs photos HD dès qu'ils les fournissent.
- **Positionnement** : le brunch (visible dès le haut de page), le coffee shop de Sorgues, un petit-déj qui voyage (msemen, baghrir, Frenchy, English), le goûter et les familles.

## Sources du contenu et points à valider

Tout le texte vient de leur bio Instagram, de leur page Facebook et des menus qu'ils y ont publiés (lus sur des captures d'écran en basse résolution).

- [ ] **Intitulés et prix du brunch** (chakchouka 11,90 €, bénédictes 12,90 €, avocado toast 14,90 €, velouté 12,90 €, jardin d'Éden 10,90 €) : lus sur un visuel flou, à confirmer.
- [ ] **Cafés, douceurs chaudes, rafraîchissantes** : intitulés lus sur un visuel flou, prix illisibles (affichés « Prix à confirmer »).
- [ ] **Horaires** dans `contenu.js` : bio Instagram, Mer–Sam 9h–17h, Dim 9h–15h. Le site ne précise pas d'heures de service du brunch.
- [ ] **« Salon de thé »** : retiré des textes en attendant confirmation (il figure dans le badge du logo officiel).
- [ ] **« Brunch & coffee shop, enfin à Sorgues »** : repose sur l'information qu'il n'y a pas d'autre coffee shop à Sorgues. À confirmer avec le client.
- [ ] **Recrutement chef(fe) de cuisine** : retirer l'actu si le poste est pourvu.
- [ ] **Téléphone** (`contact.telephone` dans `contenu.js`) : une fois renseigné, il s'affiche sur la page Venir et ajoute un bouton « Appeler » sur mobile.
- [ ] **Infos pratiques** (`pratique` dans `contenu.js`) : terrasse, accessibilité, titres-restaurant, à emporter… seulement ce qui est confirmé. La liste vide n'affiche rien.
- [ ] **Mentions légales** : forme juridique, gérant, hébergeur, SIREN. Le SIREN vient d'un annuaire qui mélangeait Le Saraly et un autre restaurant (la « bâtisse de 1859 voûtée » était celle de Ju'ste Chez Moi) : à vérifier en priorité.
- [ ] **Sélecteur de palette** : retirer le bloc « Palette de démo » dans `assets/app.js` une fois la palette choisie.

## Visuels IA : garder un rendu propre

1. Utiliser **un seul style de prompt** pour tous les visuels : même lumière, même cadrage, même palette, par exemple « fond terracotta ou crème, lumière dorée du matin, ombres de feuillage ». Le site paraît ainsi cohérent.
2. Exporter les images en **1600 px** de large, au format JPG ou WebP, à **moins de 300 Ko**.
3. Respecter le format carré pour les actus (c'est aussi le format Instagram).
4. Pas de texte généré par l'IA dans l'image (il ressort souvent déformé). Le texte est ajouté par le site.

## Passerelle site ↔ réseaux sociaux

- **1 contenu = 3 canaux.** Une actu ajoutée dans `contenu.js` s'affiche sur le site. Le même visuel carré et le même texte se publient ensuite sur Instagram et Facebook.
- **Lien en bio** : `https://lesaraly.fr/liens.html` à mettre dans la bio Instagram et sur la page Facebook.
- **Aperçu de partage** : un lien du site partagé sur Facebook, WhatsApp ou Messenger affiche la carte `og.png`.
- **Google** : le site déclare la fiche « CafeOrCoffeeShop » (schema.org). À compléter par une fiche Google Business Profile qui pointe vers le site.
- **QR code** au comptoir, vers `/liens.html`.

## Mise en ligne recommandée (environ 10 € par an)

| Poste | Solution | Coût indicatif |
|---|---|---|
| Nom de domaine `lesaraly.fr` | OVHcloud, au nom du gérant | ≈ 6 € TTC la 1re année, puis ≈ 9,35 € TTC par an |
| Hébergement | Cloudflare Pages ou Netlify, offre gratuite, relié à ce dépôt GitHub (commande de build : `node build.js`, dossier publié : `dist` ; `netlify.toml` fourni) | 0 € |
| HTTPS | Automatique | 0 € |
| E-mail pro (optionnel) | Offre e-mail OVHcloud ou Zimbra | quelques € par mois |

Le domaine `lesaraly.fr` était **libre au 17/11/2026** (vérification sur le registre AFNIC). Les tarifs sont à reconfirmer au moment de la commande.

Tous les comptes (OVHcloud, GitHub, Cloudflare ou Netlify) sont créés **au nom du client**. Chaque modification poussée sur GitHub met le site à jour automatiquement. Une modification peut aussi se faire depuis l'interface web de GitHub, avec le crayon sur `contenu.js`.

## Vérifier avant chaque mise en ligne

```bash
npm install
```

```bash
npm run verify
```

Le script ouvre chaque page dans Chromium (Playwright requis) et lance 197 vérifications : erreurs, liens, contenu comparé à `tests/faits-verifies.json`, badge ouvert/fermé, accessibilité WCAG A/AA, barre mobile, confort sur téléphone (320 et 390 px : débordement, cibles tactiles ≥ 44 px, textes ≥ 12 px). Détails dans `.claude/skills/verify/SKILL.md`.

## Aperçu en local

```bash
python3 -m http.server 8080
```
