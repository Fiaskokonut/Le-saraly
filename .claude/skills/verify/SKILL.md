---
name: verify
description: Vérifier le site Le Saraly de bout en bout avant tout commit (pages, parcours visiteur, liens, contenu comparé aux sources, badge ouvert/fermé).
---

# Vérifier le site Le Saraly

Lancer depuis la racine du dépôt (après `npm install` pour le test d'accessibilité) :

```bash
node tests/verify.js
```

Le script sert le dossier en local et ouvre chaque page dans Chromium (Playwright), comme un visiteur, à 1280 px et 390 px. Il vérifie :

1. aucune erreur JavaScript, aucun fichier local manquant, pas de défilement horizontal ;
2. le parcours : menu → chaque page, lien actif, menu mobile, retour par le logo, sélecteur de palette ;
3. tous les liens internes répondent ;
4. le contenu affiché correspond à `tests/faits-verifies.json` : prix, horaires, adresse, e-mail, mots interdits (formulations non vérifiées) ;
5. le badge « Ouvert / Fermé » est juste sur une semaine complète (336 instants) ;
6. accessibilité WCAG 2 A/AA (axe-core, après `npm install`), barre d'actions mobile, blocs vides masqués, robots.txt et sitemap.xml.
7. confort sur téléphone, en 320 et 390 px : pas de débordement, cibles tactiles ≥ 44 px, textes ≥ 12 px, fin du pied de page visible.

## Règles

- Le référentiel `tests/faits-verifies.json` est la source de vérité. **Ne jamais le modifier pour faire passer un test.** On le met à jour seulement quand le client confirme une information, en indiquant la source.
- Un texte qui ne vient d'aucune source listée dans le référentiel n'a pas sa place sur le site.
- Si une vérification échoue encore après trois tentatives de correction, s'arrêter et demander à un humain.
- Indiquer dans le message de commit comment le changement a été vérifié (« Vérifié : node tests/verify.js, N OK »).
