# Le Saraly — site vitrine

Landing page du coffee shop **Le Saraly**, 157 cours de la République, 84700 Sorgues.
Site statique en HTML, CSS et JS. Il n'y a ni CMS, ni base de données, ni étape de build : il suffit d'ouvrir `index.html`.

```
index.html             page principale (carte, lieu, actus, accès)
liens.html             page « lien en bio » pour Instagram (remplace Linktree)
mentions-legales.html  obligatoire en France (champs jaunes à compléter)
contenu.js             horaires et actus : le seul fichier à modifier au quotidien
assets/style.css       styles (les couleurs de la DA sont en haut du fichier)
assets/app.js          statut ouvert/fermé, actus, menu mobile
assets/img/            favicon et og.png (aperçu lors d'un partage de lien)
assets/visuels/        visuels du lieu et des actus (photos ou visuels IA)
```

## À valider avec le client avant la mise en ligne

- [ ] **Couleurs** : caler les variables `:root` de `assets/style.css` sur leur DA Instagram et Facebook (logo, teintes des visuels IA).
- [ ] **Horaires** : dans `contenu.js`, les valeurs actuelles sont provisoires.
- [ ] **Carte et prix** dans `index.html` : les prix actuels sont indicatifs.
- [ ] **Visuels** : déposer dans `assets/visuels/` les fichiers `hero.jpg`, `lieu-1.jpg`, `lieu-2.jpg`, `lieu-3.jpg` et `actu-*.jpg`. Tant qu'un fichier manque, une illustration de remplacement s'affiche.
- [ ] **Mentions légales** : forme juridique, gérant, contact, hébergeur.
- [ ] **Sélecteur de palette** : il ne sert qu'à la démo. Retirer le bloc `.demo-theme` dans `index.html`.

## Visuels IA : garder un rendu propre

1. Utiliser **un seul style de prompt** pour tous les visuels : même lumière, même cadrage, même palette, par exemple « briques chaudes, lumière dorée, vue de dessus ». Le site paraît ainsi cohérent.
2. Exporter les images en **1600 px** de large, au format JPG ou WebP, à **moins de 300 Ko**.
3. Respecter les formats : carré pour les actus (c'est aussi le format Instagram) et 3:4 pour les arches de la section « Le lieu ».
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
| Hébergement | Cloudflare Pages ou Netlify, offre gratuite, relié à ce dépôt GitHub | 0 € |
| HTTPS | Automatique | 0 € |
| E-mail pro (optionnel) | Offre e-mail OVHcloud ou Zimbra | quelques € par mois |

Le domaine `lesaraly.fr` était **libre au 17/11/2026** (vérification sur le registre AFNIC). Les tarifs sont à reconfirmer au moment de la commande.

Tous les comptes (OVHcloud, GitHub, Cloudflare ou Netlify) sont créés **au nom du client**. Chaque modification poussée sur GitHub met le site à jour automatiquement. Une modification peut aussi se faire depuis l'interface web de GitHub, avec le crayon sur `contenu.js`.

## Aperçu en local

```bash
python3 -m http.server 8080
```
