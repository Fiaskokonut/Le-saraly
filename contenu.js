/* =========================================================
   CONTENU MODIFIABLE — Le Saraly
   Le seul fichier à toucher au quotidien. Il alimente toutes les pages :
   horaires, carte, formules et actus.
   Garder les guillemets et les virgules telles qu'elles sont.

   Sources : bio Instagram et menus publiés sur Facebook (captures basse
   résolution). prix: null = prix non lisible, affiché "Prix à confirmer".
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

  // Contact. Le téléphone n'est pas encore connu : laisser "" tant qu'il n'est pas
  // confirmé. Une fois rempli, il s'affiche sur la page Venir et dans la barre mobile.
  contact: {
    telephone: "",            // ex. "04 90 00 00 00"
    email: "lesaraly@gmail.com"
  },

  // Infos pratiques affichées sur la page Venir, seulement si la liste n'est pas vide.
  // N'y mettre que ce que le client a confirmé. Exemples : "Terrasse",
  // "Accès personnes à mobilité réduite", "Titres-restaurant acceptés",
  // "Vente à emporter", "Animaux bienvenus", "Wi-Fi".
  pratique: [],

  // Formules du matin (menu Facebook "de 9h à 10h30")
  matin: {
    horaire: "de 9h à 10h30",
    formules: [
      { nom: "Le Saraly", prix: "15,90 €", desc: "Boisson chaude, petit jus pressé, msemen, baghrir ou harcha, amlou, miel ou huile d’olive, fromage frais." },
      { nom: "Le Frenchy", prix: "9,90 €", desc: "Boisson chaude, jus pressé, demi-baguette (beurre, confiture, miel), viennoiserie." },
      { nom: "L’English", prix: "12,90 €", desc: "Le petit-déjeuner à l’anglaise, avec une boisson chaude." }
    ]
  },

  // La carte. "accueil: true" = affichée aussi sur la page d'accueil.
  carte: [
    {
      titre: "Le brunch", label: "Salé & sucré", accueil: true,
      items: [
        { nom: "La chakchouka du Saraly", prix: "11,90 €", tag: "Salé" },
        { nom: "Les bénédictes du Sud", prix: "12,90 €", tag: "Salé" },
        { nom: "Avocado toast", prix: "14,90 €", tag: "Salé" },
        { nom: "Le velouté du Saraly", prix: "12,90 €", tag: "Salé" },
        { nom: "Le jardin d’Éden", prix: "10,90 €", tag: "Sucré" }
      ]
    },
    {
      titre: "Les cafés", label: "Coffee shop", accueil: true,
      items: [
        { nom: "Espresso", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Café allongé", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Double espresso", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Cappuccino", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Latte macchiato", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Mocha", prix: null } // prix non lisible sur leurs visuels
      ]
    },
    {
      titre: "Douceurs chaudes", label: "Sans café",
      items: [
        { nom: "Chocolat chaud", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Chocolat viennois", prix: null } // prix non lisible sur leurs visuels
      ]
    },
    {
      titre: "Les rafraîchissantes", label: "Bien frais",
      items: [
        { nom: "Jus d’orange pressé", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Citronnade du Saraly", prix: null }, // prix non lisible sur leurs visuels
        { nom: "Thé glacé maison du moment", prix: null } // prix non lisible sur leurs visuels
      ]
    }
  ],

  // Encarts de la carte
  formules: [
    {
      label: "Menu goûter", titre: "Le goûter",
      items: [
        { nom: "Le petit goûter", prix: "4,90 €", desc: "Une gourmandise au choix et une petite boisson au choix." },
        { nom: "Le goûter gourmand", prix: "6,90 €", desc: "Un pancake au choix." }
      ]
    },
    {
      label: "Jusqu’à 12 ans", titre: "Le P’tit Saraly",
      texte: "Œuf au plat ou brouillé, bacon ou saumon, une tranche de pain grillé. Puis un pancake au Nutella ou un cookie, et une petite boisson."
    },
    {
      label: "Au comptoir", titre: "Les douceurs",
      texte: "Cookie maison, brownie maison, part de cake du moment."
    }
  ],

  // Actus : la plus récente en premier.
  // "image" est optionnel : déposer le visuel (carré, comme sur Instagram)
  // dans assets/visuels/ puis écrire son chemin ici. Sans image, une affiche
  // aux couleurs du Saraly est générée avec "affiche".
  // "date" est optionnelle (format "AAAA-MM-JJ").
  actus: [
    {
      date: "",
      type: "On recrute",
      titre: "Chef(fe) de cuisine recherché(e)",
      texte: "Le Saraly recrute son chef ou sa cheffe de cuisine. Candidature : lesaraly@gmail.com",
      image: "",
      affiche: { kicker: "Le Saraly · Sorgues", titre: "Recrutement", script: "Chef(fe) de cuisine" }
    },
    {
      date: "",
      type: "Menu",
      titre: "Le goûter dès 4,90 €",
      texte: "Le petit goûter : une gourmandise et une petite boisson au choix. Le goûter gourmand à 6,90 € : un pancake au choix.",
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
