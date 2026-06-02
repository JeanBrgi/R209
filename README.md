# ⛅ Instant Weather

Application web météo permettant de consulter les prévisions pour toutes les communes de France, réalisée dans le cadre de la SAÉ R209 — IUT Réseaux & Télécommunications, Caen.

---

## Présentation

**Instant Weather** est une application front-end 100 % vanilla (HTML, CSS, JavaScript) sans framework ni dépendance externe. Elle permet à l'utilisateur de rechercher une commune française par code postal, puis d'afficher ses prévisions météorologiques pour 1 à 7 jours, avec des données optionnelles configurables.

---

## Objectifs pédagogiques

- Consommer une API REST conformément à sa documentation
- Manipuler le DOM pour intégrer dynamiquement du contenu dans une page HTML
- Produire une interface responsive et accessible (WCAG AA 2.0)

---

## APIs utilisées

| API | Usage | Documentation |
|-----|-------|---------------|
| **Découpage administratif** | Recherche de communes par code postal | [geo.api.gouv.fr](https://geo.api.gouv.fr/decoupage-administratif/communes) |
| **MétéoConcept** | Prévisions météo journalières par code INSEE | [api.meteo-concept.com](https://api.meteo-concept.com/) |

---

## Fonctionnalités

### Version de base
- Saisie d'un code postal avec chargement automatique des communes correspondantes (debounce 350 ms)
- Sélection de la commune dans un menu déroulant
- Affichage de la météo du jour : température min/max, probabilité de pluie, ensoleillement

### Version avancée
- Sélection du nombre de jours de prévision (1 à 7) via un slider
- Affichage en grille de cartes météo animées, une par jour
- Données complémentaires activables via cases à cocher :
  - Latitude / Longitude
  - Cumul de pluie (mm)
  - Vent moyen (km/h)
  - Direction du vent (°)

---

## Structure du projet

```
R209/
├── index.html        # Structure de la page
├── CSS/
│   └── style.css     # Styles (thème dark, animations, responsive)
└── js/
    └── app.js        # Logique applicative (appels API, rendu DOM)
```

---

## Lancement

Aucune installation requise. Il suffit d'ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Edge…).

> **Note :** L'application utilise l'API MétéoConcept avec un token d'authentification inclus dans `app.js`. Ce token est lié au compte créé pour le projet.

---

## Détails techniques

- **Langages :** HTML5, CSS3, JavaScript (ES2020+)
- **Polices :** [Syne](https://fonts.google.com/specimen/Syne) (titres) · [DM Sans](https://fonts.google.com/specimen/DM+Sans) (corps) via Google Fonts
- **Design :** thème sombre, glassmorphism (`backdrop-filter: blur`), fond étoilé généré dynamiquement
- **Responsive :** CSS Grid avec `auto-fill / minmax`, media query à 500 px
- **Accessibilité :** `<html lang="fr">`, labels associés aux champs, focus visible, structure sémantique

---

## Conformité

| Critère | Statut |
|---------|--------|
| Validation HTML W3C | À vérifier sur [validator.w3.org](https://validator.w3.org) |
| Validation CSS W3C | À vérifier sur [jigsaw.w3.org](https://jigsaw.w3.org/css-validator/) |
| Responsive | ✅ |
| WCAG AA 2.0 | Partiellement conforme — contrastes à vérifier |

---

## Équipe

Projet réalisé en groupe dans le cadre du BUT Réseaux & Télécommunications — IUT de Caen.

---
