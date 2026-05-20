// Configuration des API
const TOKEN_METEO = "31633472c396141108eca3a1451e45ae4c9156b2951ecf0f4ac2a1282474fe02";
const URL_METEO = "https://api.meteo-concept.com/api";
const URL_COMMUNES = "https://geo.api.gouv.fr/communes";

// Éléments de la page
const champCodePostal = document.querySelector("#code-postal");
const choixCommune = document.querySelector("#communeSelect");
const formulaire = document.querySelector("#cityForm_form");
const blocMeteo = document.querySelector("#weatherInformation");
let delaiRecherche;

// Quitte l'affichage météo seul sur mobile
function revenirRecherche() {
  document.body.classList.remove("meteo-mobile-visible");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Affiche un message dans la zone météo
function afficherMessageMeteo(message, erreur = false) {
  blocMeteo.innerHTML = `<p class="${erreur ? "errorMessage" : ""}">${message}</p>`;
  blocMeteo.style.display = "grid";
}

// Remplace le contenu de la liste des communes
function afficherOptionCommune(message) {
  choixCommune.innerHTML = "";
  const option = document.createElement("option");

  option.value = "";
  option.textContent = message;
  choixCommune.appendChild(option);
}

// Crée une petite carte d'information météo
function creerCarteMeteo(titre, valeur, classe = "") {
  const carte = document.createElement("div");
  const sousTitre = document.createElement("h3");
  const texte = document.createElement("p");

  carte.className = classe ? `carte-meteo ${classe}` : "carte-meteo";
  sousTitre.textContent = titre;
  texte.textContent = valeur;
  carte.append(sousTitre, texte);

  return carte;
}

// Crée le bouton de retour affiché avec les résultats sur mobile
function creerBoutonRetour() {
  const bouton = document.createElement("button");

  bouton.type = "button";
  bouton.className = "retourButton";
  bouton.textContent = "Retour";
  bouton.addEventListener("click", revenirRecherche);

  return bouton;
}

// Transforme le code météo en texte simple
function nomMeteo(codeMeteo) {
  if (codeMeteo === 0) return "Soleil";
  if ([1, 2].includes(codeMeteo)) return "Éclaircies";
  if ([3, 4, 5].includes(codeMeteo)) return "Nuageux";
  if ([6, 7].includes(codeMeteo)) return "Brouillard";
  if ([10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48, 210, 211, 212].includes(codeMeteo)) return "Pluie";
  if ([20, 21, 22, 60, 61, 62, 63, 64, 65, 66, 67, 68, 220, 221, 222].includes(codeMeteo)) return "Neige";
  if ([30, 31, 32, 70, 71, 72, 73, 74, 75, 76, 77, 78, 141, 230, 231, 232].includes(codeMeteo)) return "Pluie et neige";
  if (codeMeteo >= 100 && codeMeteo <= 142) return "Orage";
  if (codeMeteo === 235) return "Grêle";

  return "Météo inconnue";
}

// Choisit le fond de page selon la météo
function themeMeteo(codeMeteo) {
  if (codeMeteo === 0) return "soleil";
  if ([1, 2].includes(codeMeteo)) return "eclaircies";
  if ([3, 4, 5].includes(codeMeteo)) return "nuageux";
  if ([6, 7].includes(codeMeteo)) return "brouillard";
  if ([10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48, 210, 211, 212].includes(codeMeteo)) return "pluie";
  if ([20, 21, 22, 60, 61, 62, 63, 64, 65, 66, 67, 68, 220, 221, 222].includes(codeMeteo)) return "neige";
  if ([30, 31, 32, 70, 71, 72, 73, 74, 75, 76, 77, 78, 141, 230, 231, 232].includes(codeMeteo)) return "neige";
  if (codeMeteo >= 100 && codeMeteo <= 142) return "orage";
  if (codeMeteo === 235) return "pluie";

  return "soleil";
}

// Applique le fond météo sur la page
function changerFondMeteo(codeMeteo) {
  const themes = ["meteo-soleil", "meteo-eclaircies", "meteo-nuageux", "meteo-brouillard", "meteo-pluie", "meteo-neige", "meteo-orage"];

  document.body.classList.remove(...themes);
  document.body.classList.add(`meteo-${themeMeteo(codeMeteo)}`);
}

// Convertit les dates renvoyées par Meteo Concept
function lireDateMeteo(dateTexte) {
  const regexFuseau = /([+-]\d{2})(\d{2})$/;
  const formatFuseau = "$1:$2";
  const dateLisible = dateTexte.replace(regexFuseau, formatFuseau);

  return new Date(dateLisible);
}

// Affiche une date en français
function formaterDate(dateTexte) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(lireDateMeteo(dateTexte));
}

// Charge une URL et récupère le JSON
async function chargerJson(url, options = {}) {
  const reponse = await fetch(url, options);

  if (!reponse.ok) {
    throw new Error(`Erreur API ${reponse.status}`);
  }

  return reponse.json();
}

// Récupère les communes à partir du code postal
async function chargerCommunes(codePostal) {
  const url = new URL(URL_COMMUNES);

  url.searchParams.set("codePostal", codePostal);
  url.searchParams.set("fields", "nom,code,codesPostaux");
  url.searchParams.set("format", "json");

  return chargerJson(url);
}

// Ajoute les communes dans la liste déroulante
function afficherCommunes(communes) {
  afficherOptionCommune("Sélectionnez une commune");

  communes.forEach((commune) => {
    const option = document.createElement("option");

    option.value = commune.code;
    option.textContent = commune.nom;
    choixCommune.appendChild(option);
  });
}

// Affiche les données météo dans les cartes
function afficherMeteo(meteo) {
  const ville = meteo.city;
  const prevision = meteo.forecast;
  const miseAJour = meteo.update;

  changerFondMeteo(prevision.weather);
  blocMeteo.innerHTML = "";
  blocMeteo.style.display = "grid";

  blocMeteo.append(
    creerBoutonRetour(),
    creerCarteMeteo(`${ville.name} - ${formaterDate(prevision.datetime)}`, nomMeteo(prevision.weather), `carte-principale temps-${themeMeteo(prevision.weather)}`),
    creerCarteMeteo("Températures", `${prevision.tmin}°C min / ${prevision.tmax}°C max`),
    creerCarteMeteo("Pluie", `${prevision.probarain}% de risque - ${prevision.rr10} mm prévus`),
    creerCarteMeteo("Vent", `${prevision.wind10m} km/h moyen - rafales ${prevision.gust10m} km/h`),
    creerCarteMeteo("Soleil", `${prevision.sun_hours} h d'ensoleillement`),
    creerCarteMeteo("Mise à jour", lireDateMeteo(miseAJour).toLocaleString("fr-FR"))
  );
  document.body.classList.add("meteo-mobile-visible");
  blocMeteo.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Recherche les communes quand le code postal change
async function chercherCommunes() {
  const codePostal = champCodePostal.value.trim();

  if (!/^\d{5}$/.test(codePostal)) {
    afficherOptionCommune("Code postal invalide");
    return;
  }

  afficherOptionCommune("Chargement...");

  try {
    const communes = await chargerCommunes(codePostal);

    if (communes.length === 0) {
      afficherOptionCommune("Aucune commune trouvée");
      return;
    }

    afficherCommunes(communes);
  } catch (erreur) {
    console.error(erreur);
    afficherOptionCommune("Erreur de chargement");
  }
}

// Récupère la météo avec le code INSEE de la commune
async function chargerMeteo(codeInsee) {
  const url = new URL(`${URL_METEO}/forecast/daily/0`);

  url.searchParams.set("token", TOKEN_METEO);
  url.searchParams.set("insee", codeInsee);

  return chargerJson(url, {
    headers: {
      Accept: "application/json",
    },
  });
}

// Lance la recherche météo après validation
async function validerCommune() {
  const codeInsee = choixCommune.value;

  if (!codeInsee) {
    afficherMessageMeteo("Sélectionnez une commune avant de valider.", true);
    return;
  }

  afficherMessageMeteo("Chargement de la météo...");

  try {
    const meteo = await chargerMeteo(codeInsee);
    afficherMeteo(meteo);
  } catch (erreur) {
    console.error(erreur);
    afficherMessageMeteo("Impossible de récupérer la météo pour cette commune.", true);
  }
}

// Validation avec la touche Entrée
formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  validerCommune();
});

// Recherche automatique après la saisie du code postal
champCodePostal.addEventListener("input", () => {
  window.clearTimeout(delaiRecherche);
  delaiRecherche = window.setTimeout(chercherCommunes, 350);
});

afficherOptionCommune("Entrez un code postal");

// Animation du favicon
const animationFavicon = (() => {
  const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
  const zoneDessin = document.createElement("canvas");
  const contexte = zoneDessin.getContext("2d");
  const taille = 32;

  zoneDessin.width = taille;
  zoneDessin.height = taille;
  favicon.rel = "icon";
  favicon.type = "image/png";

  if (!favicon.parentNode) {
    document.head.appendChild(favicon);
  }

  function effacer() {
    contexte.clearRect(0, 0, taille, taille);
  }

  function dessinerSoleil() {
    effacer();

    contexte.fillStyle = "#ffd45a";
    contexte.beginPath();
    contexte.arc(16, 16, 8, 0, Math.PI * 2);
    contexte.fill();

    contexte.strokeStyle = "#ffb428";
    contexte.lineWidth = 2;
    contexte.lineCap = "round";

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const debut = 11;
      const fin = 14;

      contexte.beginPath();
      contexte.moveTo(16 + Math.cos(angle) * debut, 16 + Math.sin(angle) * debut);
      contexte.lineTo(16 + Math.cos(angle) * fin, 16 + Math.sin(angle) * fin);
      contexte.stroke();
    }

    return zoneDessin.toDataURL("image/png");
  }

  function dessinerNuage() {
    effacer();

    contexte.fillStyle = "#ffffff";
    contexte.shadowColor = "rgba(25, 88, 135, 0.22)";
    contexte.shadowBlur = 2;
    contexte.shadowOffsetY = 1;

    contexte.beginPath();
    contexte.arc(11, 18, 5, 0, Math.PI * 2);
    contexte.arc(16, 14, 7, 0, Math.PI * 2);
    contexte.arc(22, 18, 5, 0, Math.PI * 2);
    contexte.ellipse(16, 20, 12, 5, 0, 0, Math.PI * 2);
    contexte.fill();

    contexte.shadowColor = "transparent";

    return zoneDessin.toDataURL("image/png");
  }

  function dessinerPluie() {
    effacer();

    contexte.fillStyle = "#ffffff";
    contexte.beginPath();
    contexte.arc(11, 13, 5, 0, Math.PI * 2);
    contexte.arc(16, 10, 7, 0, Math.PI * 2);
    contexte.arc(22, 13, 5, 0, Math.PI * 2);
    contexte.ellipse(16, 15, 12, 5, 0, 0, Math.PI * 2);
    contexte.fill();

    contexte.strokeStyle = "#2f9be7";
    contexte.lineWidth = 2;
    contexte.lineCap = "round";

    [[10, 22], [16, 24], [22, 22]].forEach(([x, y]) => {
      contexte.beginPath();
      contexte.moveTo(x, y - 4);
      contexte.lineTo(x - 2, y + 1);
      contexte.stroke();
    });

    return zoneDessin.toDataURL("image/png");
  }

  const images = [dessinerSoleil(), dessinerNuage(), dessinerPluie()];
  let imageActuelle = 0;

  function animer() {
    favicon.href = images[imageActuelle];
    imageActuelle = (imageActuelle + 1) % images.length;
  }

  animer();

  return window.setInterval(animer, 850);
})();
