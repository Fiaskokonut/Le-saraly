/* =========================================================
   CONTENU MODIFIABLE — Le Saraly
   C'est le seul fichier à toucher pour :
   - changer les horaires
   - publier une actu (elle s'affiche sur le site, et le même texte + visuel
     sert pour Instagram / Facebook)
   Garder les guillemets et les virgules telles qu'elles sont.
   ========================================================= */
window.SARALY = {
  // Horaires (format 24h "HH:MM"). null = fermé.
  // Source : bio Instagram "Mer-Sam 9/17h • Dim 9/15h".
  horaires: {
    lundi:    null,
    mardi:    null,
    mercredi: ["09:00", "17:00"],
    jeudi:    ["09:00", "17:00"],
    vendredi: ["09:00", "17:00"],
    samedi:   ["09:00", "17:00"],
    dimanche: ["09:00", "15:00"]
  },

  // Actus : la plus récente en premier.
  // "image" est optionnel : déposer le visuel (carré, comme sur Instagram)
  // dans assets/visuels/ puis écrire son chemin ici. Sans image, une affiche
  // aux couleurs du Saraly est générée avec "affiche" (titre + phrase manuscrite).
  // "date" est optionnelle (format "AAAA-MM-JJ").
  actus: [
    {
      date: "",
      type: "On recrute",
      titre: "Chef(fe) de cuisine recherché(e)",
      texte: "Passionné(e), organisé(e) et motivé(e) ? Rejoignez l’aventure brunch. Candidature : lesaraly@gmail.com",
      image: "",
      affiche: { kicker: "Le Saraly · Sorgues", titre: "Recrutement", script: "Chef(fe) de cuisine" }
    },
    {
      date: "",
      type: "Menu",
      titre: "Le goûter dès 4,90 €",
      texte: "Le petit goûter : une gourmandise et une petite boisson. Le goûter gourmand à 6,90 € : un pancake au choix.",
      image: "",
      affiche: { kicker: "Petites douceurs", titre: "Menu goûter", script: "pour de grands sourires" }
    },
    {
      date: "",
      type: "Enfants",
      titre: "Le P’tit Saraly",
      texte: "Jusqu’à 12 ans : œuf, bacon ou saumon, pain grillé, une petite douceur et une boisson.",
      image: "",
      affiche: { kicker: "Jusqu’à 12 ans", titre: "Le P’tit", script: "Saraly" }
    }
  ]
};
