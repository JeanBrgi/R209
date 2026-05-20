
const TOKEN_METEO  = "31633472c396141108eca3a1451e45ae4c9156b2951ecf0f4ac2a1282474fe02";
const URL_METEO    = "https://api.meteo-concept.com/api";
const URL_COMMUNES = "https://geo.api.gouv.fr/communes";


(() => {
  const container = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${2+Math.random()*4}s;--delay:-${Math.random()*4}s;--op:${0.1+Math.random()*0.4};`;
    container.appendChild(s);
  }
})();


function switchTab(v) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + v).classList.add('active');
  document.getElementById('panel-' + v).classList.add('active');
}


function updateRange(v) {
  document.getElementById('days-display').textContent = v;
  document.getElementById('days-range').style.setProperty('--pct', ((v - 1) / 6 * 100) + '%');
}
updateRange(1);


function showError(id, msg) {
  const e = document.getElementById(id);
  e.textContent = msg;
  e.classList.add('visible');
}

function hideError(id) {
  document.getElementById(id).classList.remove('visible');
}

function showResults(id) {
  document.getElementById(id).classList.add('visible');
}

function clearResults(id) {
  const e = document.getElementById(id);
  e.innerHTML = '';
  e.classList.remove('visible');
}


async function chargerJson(url, options = {}) {
  const reponse = await fetch(url, options);
  if (!reponse.ok) throw new Error(`Erreur API ${reponse.status}`);
  return reponse.json();
}

async function chargerCommunes(codePostal) {
  const url = new URL(URL_COMMUNES);
  url.searchParams.set("codePostal", codePostal);
  url.searchParams.set("fields", "nom,code,codesPostaux");
  url.searchParams.set("format", "json");
  return chargerJson(url);
}

async function chargerMeteo(codeInsee) {
  const url = new URL(`${URL_METEO}/forecast/daily`);
  url.searchParams.set("token", TOKEN_METEO);
  url.searchParams.set("insee", codeInsee);
  return chargerJson(url, { headers: { Accept: "application/json" } });
}

// ── DATES (même correction fuseau que le code de référence) ───────────────
function lireDateMeteo(dateTexte) {
  const dateLisible = dateTexte.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return new Date(dateLisible);
}

function formaterDate(dateTexte) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(lireDateMeteo(dateTexte));
}


function nomMeteo(code) {
  if (code === 0) return ['Soleil', '☀️'];
  if ([1, 2].includes(code)) return ['Éclaircies', '🌤️'];
  if ([3, 4, 5].includes(code)) return ['Nuageux', '☁️'];
  if ([6, 7].includes(code)) return ['Brouillard', '🌫️'];
  if ([10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48, 210, 211, 212].includes(code)) return ['Pluie', '🌧️'];
  if ([20, 21, 22, 60, 61, 62, 63, 64, 65, 66, 67, 68, 220, 221, 222].includes(code)) return ['Neige', '❄️'];
  if ([30, 31, 32, 70, 71, 72, 73, 74, 75, 76, 77, 78, 141, 230, 231, 232].includes(code)) return ['Pluie et neige', '🌨️'];
  if (code >= 100 && code <= 142) return ['Orage', '⛈️'];
  if (code === 235) return ['Grêle', '⛈️'];
  return ['Conditions variables', '🌈'];
}


function remplirSelect(selectId, communes) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = '';

  if (communes.length === 0) {
    sel.innerHTML = '<option value="">Aucune commune trouvée</option>';
    return;
  }

  if (communes.length > 1) {
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Sélectionnez une commune';
    sel.appendChild(ph);
  }

  communes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.nom;
    sel.appendChild(opt);
  });

  if (communes.length === 1) sel.selectedIndex = 0;
}

function ecouterCodePostal(inputId, selectId, errorId) {
  let delai;
  document.getElementById(inputId).addEventListener('input', function () {
    const cp = this.value.replace(/\D/g, '');
    this.value = cp;
    clearTimeout(delai);
    hideError(errorId);

    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">Entrez un code postal</option>';

    if (!/^\d{5}$/.test(cp)) return;

    sel.innerHTML = '<option value="">Chargement...</option>';

    delai = setTimeout(async () => {
      try {
        const communes = await chargerCommunes(cp);
        remplirSelect(selectId, communes);
      } catch (err) {
        sel.innerHTML = '<option value="">Erreur de chargement</option>';
        showError(errorId, 'Impossible de charger les communes : ' + err.message);
      }
    }, 350);
  });
}

// Un seul formulaire partagé pour les deux versions
ecouterCodePostal('code-postal', 'communeSelect', 'error-v1');


async function validerV1() {
  hideError('error-v1');
  clearResults('results-v1');

  const codeInsee = document.getElementById('communeSelect').value;
  if (!codeInsee) {
    showError('error-v1', 'Veuillez saisir un code postal et sélectionner une commune.');
    return;
  }

  const btn = document.getElementById('btn-v1');
  btn.disabled = true;
  btn.textContent = 'Chargement…';

  try {
    const data = await chargerMeteo(codeInsee);
    const f = data.forecast[0];
    const city = data.city;
    const [label, emoji] = nomMeteo(f.weather);
    const sunH = f.sun_hours ?? f.sunHours ?? '–';

    const zone = document.getElementById('results-v1');

    const bloc = document.createElement('div');
    bloc.className = 'weather-v1';
    bloc.innerHTML = `
      <div class="weather-v1-header">
        <div>
          <div class="city-name">${city.name}</div>
          <div class="weather-date">${formaterDate(f.datetime)} &middot; ${label}</div>
        </div>
        <div class="weather-emoji">${emoji}</div>
      </div>
      <div class="weather-v1-body">
        <div class="stat-block">
          <span class="stat-label">Température min</span>
          <span class="stat-value temp-min">${f.tmin}<span class="stat-unit">°C</span></span>
        </div>
        <div class="stat-block">
          <span class="stat-label">Température max</span>
          <span class="stat-value temp-max">${f.tmax}<span class="stat-unit">°C</span></span>
        </div>
        <div class="stat-block">
          <span class="stat-label">Probabilité de pluie</span>
          <span class="stat-value rain">${f.probarain}<span class="stat-unit">%</span></span>
        </div>
        <div class="stat-block">
          <span class="stat-label">Ensoleillement</span>
          <span class="stat-value sun">${sunH}<span class="stat-unit">h</span></span>
        </div>
      </div>`;

    zone.appendChild(bloc);
    showResults('results-v1');

  } catch (err) {
    showError('error-v1', 'Impossible de récupérer la météo : ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Afficher la météo';
  }
}


async function validerV2() {
  hideError('error-v2');
  clearResults('results-v2');

  const codeInsee = document.getElementById('communeSelect').value;
  if (!codeInsee) {
    showError('error-v2', 'Veuillez saisir un code postal et sélectionner une commune.');
    return;
  }

  const nbJours  = parseInt(document.getElementById('days-range').value);
  const affLat   = document.getElementById('chk-lat').checked;
  const affLon   = document.getElementById('chk-lon').checked;
  const affPluie = document.getElementById('chk-rain').checked;
  const affVent  = document.getElementById('chk-wind').checked;
  const affDir   = document.getElementById('chk-winddir').checked;

  const btn = document.getElementById('btn-v2');
  btn.disabled = true;
  btn.textContent = 'Chargement…';

  try {
    const data = await chargerMeteo(codeInsee);
    const city = data.city;
    const zone = document.getElementById('results-v2');
    const grille = document.createElement('div');
    grille.className = 'cards-grid';

    data.forecast.slice(0, nbJours).forEach((f, i) => {
      const [label, emoji] = nomMeteo(f.weather);
      const sunH = f.sun_hours ?? f.sunHours ?? '–';

      // Informations optionnelles
      let extrasHTML = '';
      if (affLat || affLon || affPluie || affVent || affDir) {
        const lignes = [];
        if (affLat)   lignes.push(`<div class="wc-extra-row"><span>Latitude</span><span class="wc-extra-val">${city.latitude}°</span></div>`);
        if (affLon)   lignes.push(`<div class="wc-extra-row"><span>Longitude</span><span class="wc-extra-val">${city.longitude}°</span></div>`);
        if (affPluie) lignes.push(`<div class="wc-extra-row"><span>Cumul pluie</span><span class="wc-extra-val">${f.rr10 ?? 0} mm</span></div>`);
        if (affVent)  lignes.push(`<div class="wc-extra-row"><span>Vent moyen</span><span class="wc-extra-val">${f.wind10m ?? '–'} km/h</span></div>`);
        if (affDir)   lignes.push(`<div class="wc-extra-row"><span>Direction vent</span><span class="wc-extra-val">${f.dirwind10m ?? '–'}°</span></div>`);
        extrasHTML = `<div class="wc-extras">${lignes.join('')}</div>`;
      }

      const carte = document.createElement('div');
      carte.className = 'weather-card';
      carte.style.animationDelay = `${i * 0.07}s`;
      carte.innerHTML = `
        <div class="wc-header">
          <div class="wc-city">${city.name}</div>
          <div class="wc-date">${formaterDate(f.datetime)}</div>
        </div>
        <div class="wc-body">
          <div class="wc-icon">${emoji}</div>
          <div class="wc-label">${label}</div>
          <div class="wc-temps">
            <div class="wc-temp">
              <div class="wc-temp-label">Min</div>
              <div class="wc-temp-val min">${f.tmin}°</div>
            </div>
            <div class="wc-temp">
              <div class="wc-temp-label">Max</div>
              <div class="wc-temp-val max">${f.tmax}°</div>
            </div>
          </div>
          <div class="wc-basics"><span>🌧 ${f.probarain}%</span><span>☀️ ${sunH}h</span></div>
          ${extrasHTML}
        </div>`;

      grille.appendChild(carte);
    });

    zone.appendChild(grille);
    showResults('results-v2');

  } catch (err) {
    showError('error-v2', 'Impossible de récupérer la météo : ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Générer les cartes météo';
  }
}
