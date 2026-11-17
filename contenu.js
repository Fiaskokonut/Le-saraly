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
  // ⚠️ À CONFIRMER avec Jérémy & Julien : valeurs provisoires.
  horaires: {
    lundi:    null,
    mardi:    ["07:30", "18:30"],
    mercredi: ["07:30", "18:30"],
    jeudi:    ["07:30", "18:30"],
    vendredi: ["07:30", "18:30"],
    samedi:   ["08:00", "18:30"],
    dimanche: ["08:30", "13:00"]
  },

  // Actus : la plus récente en premier. "image" est optionnel :
  // déposer le fichier dans assets/visuels/ puis écrire son nom ici.
  actus: [
    {
      date: "2026-11-14",
      type: "Nouveauté",
      titre: "Le latte noisette est de retour",
      texte: "Il revient avec le froid. Disponible en chaud, et en glacé pour les irréductibles.",
      image: "assets/visuels/actu-latte.jpg",
      visuel: "Latte noisette"
    },
    {
      date: "2026-11-08",
      type: "Au four",
      titre: "Cookies du samedi",
      texte: "Chocolat noir, fleur de sel. Sortis à 8h, rarement là après midi.",
      image: "assets/visuels/actu-cookies.jpg",
      visuel: "Cookies du samedi"
    },
    {
      date: "2026-11-01",
      type: "Infos",
      titre: "Ouverts le 11 novembre",
      texte: "Horaires du dimanche ce jour-là. On vous attend sous les voûtes.",
      image: "",
      visuel: "Ouvert le 11/11"
    }
  ]
};
