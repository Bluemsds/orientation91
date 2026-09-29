(function () {
  'use strict';
  var D = window.DONNEES;
  if (!D) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:16px">Données introuvables (data/formations.js).</p>'); return; }

  // ---- Réglages -----------------------------------------------------------
  var SEUIL_VERT = 1;   // taux < 1  -> vert
  var SEUIL_ROUGE = 2;  // taux > 2  -> rouge ; entre les deux -> orange
  var PICTOS = {
    'Bâtiment & travaux publics': '🧱',
    'Électricité, énergie & numérique': '⚡',
    'Automobile, engins & transport': '🚗',
    'Industrie & aéronautique': '⚙️',
    'Hôtellerie, restauration & alimentation': '🍳',
    'Commerce, vente & accueil': '🛍️',
    'Logistique & gestion': '📦',
    'Santé, social & petite enfance': '🤝',
    'Beauté & bien-être': '💅',
    "Mode, cuir & métiers d'art": '🧵',
    'Sécurité': '🛡️',
    'Nature & espaces verts': '🌳'
  };
  var ORDRE_SECTEURS = Object.keys(PICTOS);
  // Adresse qui reçoit les signalements d'erreur (à changer ici si besoin)
  var CONTACT = 'serge.dos-santos@ac-versailles.fr';
  function lienSignalement(sujet) {
    var corps = "Bonjour,\n\nJ'ai repéré une erreur ou une info à mettre à jour.\n\nPage / fiche concernée : " + sujet +
      "\nCe qui ne va pas : \nLa bonne information (et la source si possible) : \n\nJe suis : (élève / parent / enseignant / CIO / autre)\n";
    return 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('[Site formations 91] Signalement : ' + sujet) + '&body=' + encodeURIComponent(corps);
  }
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  // ---- Outils -------------------------------------------------------------
  var etabs = {}, formations = {};
  D.etablissements.forEach(function (e) { etabs[e.id] = e; });
  D.formations.forEach(function (f) { formations[f.id] = f; });
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function url(u) { return /^https?:\/\//.test(u) ? u : 'https://' + u; }
  function niveauDemande(t) {
    if (t === null || t === undefined) return { cls: 'aucun', txt: 'Pas de chiffre' };
    if (t < SEUIL_VERT) return { cls: 'vert', txt: 'Places disponibles' };
    if (t > SEUIL_ROUGE) return { cls: 'rouge', txt: 'Très demandée' };
    return { cls: 'orange', txt: 'Demandée' };
  }
  function badgeDemande(t) { var n = niveauDemande(t); return '<span class="demande ' + n.cls + '"><span class="pastille ' + n.cls + '"></span>' + n.txt + '</span>'; }
  function badgeOffre(o) {
    if (o.voie === 'apprentissage') return '<span class="demande appr"><span class="pastille appr"></span>Apprentissage</span>';
    if (o.voie === 'mfr') return '<span class="demande appr"><span class="pastille appr"></span>Alternance (MFR)</span>';
    return badgeDemande(o.taux);
  }
  function pastilleOffre(o) {
    if (estAppr(o)) return '<span class="pastille appr" title="Apprentissage"></span>';
    var n = niveauDemande(o.taux); return '<span class="pastille ' + n.cls + '" title="' + n.txt + '"></span>';
  }
  function tauxTexte(t) { return t === null || t === undefined ? '—' : t.toFixed(2).replace('.', ','); }
  function etiquetteNiveau(f, court) { return '<span class="etiquette ' + (f.niveau === 'CAP' ? 'cap">CAP' + (court ? '' : ' · 2 ans') : 'bac">Bac pro' + (court ? '' : ' · 3 ans')) + '</span>'; }
  function etiquettesAcces(f) {
    var a = {}, ap = false, sc = false; f.offres.forEach(function (o) { if (o.acces) a[o.acces] = true; if (estAppr(o)) ap = true; else sc = true; });
    var h = '';
    if (ap) h += '<span class="etiquette appr">🤝 ' + (sc ? 'Aussi en apprentissage' : 'En apprentissage') + '</span>';
    if (a.segpa) h += '<span class="etiquette segpa">✔ Prioritaire SEGPA</span>';
    if (a.profil2de) h += '<span class="etiquette profil">Commission spécifique SEGPA</span>';
    if (a.erea) h += '<span class="etiquette erea">Existe en EREA</span>';
    return h;
  }
  function etiquetteType(e) {
    if (e.type === 'EREA') return ' <span class="etiquette erea">EREA</span>';
    if (e.type === 'CFA') return ' <span class="etiquette appr">CFA</span>';
    if (e.type === 'MFR') return ' <span class="etiquette appr">MFR</span>';
    return '';
  }
  function itineraire(e) {
    return 'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' + encodeURIComponent(e.nom + ', ' + e.adresse);
  }
  function jpoTexte(e) {
    if (e.jpo_texte) return e.jpo_texte;
    if (!e.jpo_precedente) return 'Dates des portes ouvertes : à consulter sur le site du lycée (souvent entre janvier et avril).';
    var p = e.jpo_precedente.split('/'), d = new Date(+p[2], +p[1] - 1, +p[0]);
    return 'L\'an dernier, les portes ouvertes ont eu lieu le ' + JOURS[d.getDay()] + ' ' + (+p[0] === 1 ? '1er' : +p[0]) + ' ' + MOIS[d.getMonth()] + ' ' + p[2] + '. Vérifie la date de cette année sur le site du lycée.';
  }

  // ---- État ---------------------------------------------------------------
  var etat = { vue: 'metiers', niveau: 'TOUS', voie: 'TOUTES', secteur: null, texte: '', ville: '' };
  function estAppr(o) { return o.voie !== 'scolaire'; }
  function enRecherche() { return !!etat.texte; }
  function voieOk(o) { return enRecherche() || etat.voie === 'TOUTES' || (etat.voie === 'scolaire' ? !estAppr(o) : estAppr(o)); }

  var villes = Array.from(new Set(D.etablissements.map(function (e) { return e.ville; }))).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  $('#ville').insertAdjacentHTML('beforeend', villes.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join(''));
  $('#source').textContent = D.maj + '.';
  (function () {
    var nbL = D.etablissements.filter(function (e) { return e.type !== 'CFA' && e.type !== 'MFR'; }).length;
    $('#nb-formations').textContent = D.formations.length;
    $('#nb-lycees').textContent = nbL;
    $('#nb-cfa').textContent = D.etablissements.length - nbL;
  })();
  $('#signaler').href = lienSignalement('général (page d\'accueil)');

  // ---- Filtrage -----------------------------------------------------------
  function offresVisibles(f) {
    var q = norm(etat.texte);
    var formationCorrespond = !q || norm(f.nom + ' ' + f.secteur + ' ' + (f.specialites || []).join(' ')).indexOf(q) !== -1;
    return f.offres.filter(function (o) {
      var e = etabs[o.etab];
      if (!voieOk(o)) return false;
      if (etat.ville && e.ville !== etat.ville) return false;
      if (formationCorrespond) return true;
      return norm(e.nom + ' ' + e.ville).indexOf(q) !== -1;
    });
  }
  function formationsFiltrees(ignorerSecteur) {
    return D.formations.filter(function (f) {
      if (!enRecherche() && etat.niveau !== 'TOUS' && f.niveau !== etat.niveau) return false;
      if (!enRecherche() && !ignorerSecteur && etat.secteur && f.secteur !== etat.secteur) return false;
      return offresVisibles(f).length > 0;
    });
  }
  // Lycées correspondant aux filtres, avec leurs formations visibles
  function lyceesFiltres() {
    var res = {};
    formationsFiltrees(false).forEach(function (f) {
      offresVisibles(f).forEach(function (o) {
        (res[o.etab] = res[o.etab] || { e: etabs[o.etab], fs: [] }).fs.push({ f: f, o: o });
      });
    });
    return Object.keys(res).map(function (k) { return res[k]; });
  }

  // ---- Rendu : secteurs ---------------------------------------------------
  function rendreSecteurs() {
    var base = formationsFiltrees(true), compte = {};
    base.forEach(function (f) { compte[f.secteur] = (compte[f.secteur] || 0) + 1; });
    $('#secteurs').innerHTML = ORDRE_SECTEURS.map(function (s) {
      var n = compte[s] || 0;
      return '<button class="secteur' + (etat.secteur === s ? ' actif' : '') + (n ? '' : ' vide') + '" data-secteur="' + esc(s) + '" aria-pressed="' + (etat.secteur === s) + '">' +
        '<span class="picto" aria-hidden="true">' + PICTOS[s] + '</span><span class="nom">' + esc(s) + '</span>' +
        '<span class="nb">' + n + ' formation' + (n > 1 ? 's' : '') + '</span></button>';
    }).join('');
  }

  // ---- Rendu : cartes formations -----------------------------------------
  function rendreResultats() {
    var liste = formationsFiltrees(false);
    if (enRecherche()) {
      var q = norm(etat.texte);
      liste = liste.slice().sort(function (a, b) { return (norm(b.nom).indexOf(q) !== -1) - (norm(a.nom).indexOf(q) !== -1); });
    }
    $('#titre-resultats').textContent = (enRecherche() ? 'Résultats pour « ' + etat.texte + ' »' : (etat.secteur || 'Toutes les formations')) + ' (' + liste.length + ')';
    $('#effacer').hidden = !(etat.secteur || etat.texte || etat.ville || etat.niveau !== 'TOUS' || etat.voie !== 'TOUTES');
    if (!liste.length) { $('#resultats').innerHTML = '<p class="vide-message">Aucune formation ne correspond. Essaie un autre mot ou une autre ville.</p>'; return; }
    $('#resultats').innerHTML = liste.map(function (f) {
      var off = offresVisibles(f).slice().sort(function (a, b) { return (estAppr(a) - estAppr(b)) || etabs[a.etab].ville.localeCompare(etabs[b.etab].ville, 'fr'); });
      var max = 4, lignes = off.slice(0, max).map(function (o) {
        var e = etabs[o.etab];
        return '<li>' + pastilleOffre(o) + '<span><span class="ville">' + esc(e.ville) + '</span> · ' + esc(e.nom.replace(/^Lycée (hôtelier du )?/, '')) + (estAppr(o) ? ' <small class="mini-appr">apprentissage</small>' : '') + '</span></li>';
      }).join('');
      var reste = off.length - max;
      if (reste > 0) lignes += '<li class="plus">+ ' + reste + ' autre' + (reste > 1 ? 's' : '') + ' lycée' + (reste > 1 ? 's' : '') + '</li>';
      return '<button class="carte" data-formation="' + f.id + '">' +
        '<div class="etiquettes">' + etiquetteNiveau(f) + etiquettesAcces(f) + '</div>' +
        '<h3>' + esc(f.nom) + '</h3>' + (seulementAppr(f) ? '<p class="seul-appr">Pas au lycée en Essonne : seulement en apprentissage</p>' : '') + '<p class="accroche">' + esc(f.description) + '</p><ul class="lieux">' + lignes + '</ul></button>';
    }).join('');
  }

  // ---- Rendu : par lycée --------------------------------------------------
  function rendreLycees() {
    var parVille = {};
    lyceesFiltres().forEach(function (x) { (parVille[x.e.ville] = parVille[x.e.ville] || []).push(x); });
    var vs = Object.keys(parVille).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    if (!vs.length) { $('#lycees').innerHTML = '<p class="vide-message">Aucun lycée ne correspond.</p>'; return; }
    $('#lycees').innerHTML = vs.map(function (v) {
      return '<div class="ville-bloc"><h2>📍 ' + esc(v) + '</h2>' + parVille[v].map(function (x) {
        return '<article class="lycee"><h3><button class="lien-titre" data-lycee="' + x.e.id + '">' + esc(x.e.nom) + '</button>' + etiquetteType(x.e) + '</h3><ul>' +
          x.fs.map(function (y) {
            return '<li><button data-formation="' + y.f.id + '">' + etiquetteNiveau(y.f, true) + '<span class="f-nom">' + esc(y.f.nom) + '</span>' + badgeOffre(y.o) + '</button></li>';
          }).join('') + '</ul></article>';
      }).join('') + '</div>';
    }).join('');
  }

  // ---- Rendu : carte ------------------------------------------------------
  var carte = null, calque = null;
  function rendreCarte() {
    var zone = $('#carte');
    if (typeof L === 'undefined') { zone.innerHTML = '<p class="vide-message">La carte n\'a pas pu se charger. Utilise l\'onglet « Par lycée ».</p>'; return; }
    if (!carte) {
      carte = L.map(zone, { scrollWheelZoom: false }).setView([48.6, 2.3], 10);
      // Fond de carte : Plan IGN (service public, sans clé, fonctionne aussi en ouvrant le fichier en local).
      // Secours automatique : CARTO (données OpenStreetMap) si l'IGN ne répond pas.
      var fondIGN = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        { minZoom: 6, maxZoom: 18, attribution: '© IGN – Plan IGN' });
      var fondSecours = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        { maxZoom: 18, subdomains: 'abcd', attribution: '© contributeurs OpenStreetMap © CARTO' });
      var erreurs = 0;
      fondIGN.on('tileerror', function () {
        if (++erreurs === 3) { carte.removeLayer(fondIGN); fondSecours.addTo(carte); }
      });
      fondIGN.addTo(carte);
      calque = L.layerGroup().addTo(carte);
    }
    setTimeout(function () { carte.invalidateSize(); }, 50);
    calque.clearLayers();
    var parVille = {};
    lyceesFiltres().forEach(function (x) { (parVille[x.e.ville] = parVille[x.e.ville] || []).push(x); });
    var points = [];
    Object.keys(parVille).forEach(function (v) {
      var liste = parVille[v], e0 = liste[0].e, n = liste.length;
      var icone = L.divIcon({ className: 'repere', html: '<span>' + n + '</span>', iconSize: [34, 34], iconAnchor: [17, 17] });
      var html = '<div class="bulle"><strong>📍 ' + esc(v) + '</strong><ul>' + liste.map(function (x) {
        return '<li><button class="lien" data-lycee="' + x.e.id + '">' + esc(x.e.nom) + '</button><br><small>' + x.fs.length + ' formation' + (x.fs.length > 1 ? 's' : '') + (x.e.type === 'CFA' || x.e.type === 'MFR' ? ' · ' + x.e.type : '') + '</small></li>';
      }).join('') + '</ul></div>';
      L.marker([e0.lat, e0.lon], { icon: icone, title: v }).bindPopup(html).addTo(calque);
      points.push([e0.lat, e0.lon]);
    });
    if (points.length) carte.fitBounds(points, { padding: [30, 30], maxZoom: 12 });
  }

  // ---- Fiches (fenêtre) ---------------------------------------------------
  function ouvrir(html) {
    var t = (html.match(/id="fiche-titre">([^<]*)</) || [])[1] || 'fiche';
    var tmp = document.createElement('textarea'); tmp.innerHTML = t;
    $('#fiche-contenu').innerHTML = html + piedFiche(tmp.value);
    var d = $('#fiche');
    $('#fiche-contenu').scrollTop = 0;
    if (!d.open) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
    d.scrollTop = 0;
    d.querySelector('.fermer').focus();
  }
  function fermerFiche() { var d = $('#fiche'); if (d.close) d.close(); else d.removeAttribute('open'); }
  function seulementAppr(f) { return f.offres.every(estAppr); }
  function enTete(etiquettes, titre) {
    return '<div class="fiche-haut"><div><div class="etiquettes">' + etiquettes + '</div><h2 id="fiche-titre">' + esc(titre) + '</h2></div><button class="fermer" aria-label="Fermer">×</button></div>';
  }
  function piedFiche(titre) {
    return '<p class="signaler-fiche"><a href="' + esc(lienSignalement(titre)) + '">⚠️ Une erreur sur cette fiche ? Signale-la</a></p>';
  }

  function ouvrirFormation(id) {
    var f = formations[id]; if (!f) return;
    var acc = {}; f.offres.forEach(function (o) { if (o.acces) acc[o.acces] = true; });
    var enc = '';
    if (seulementAppr(f)) enc += '<div class="encadre appr"><strong>Cette formation n\'existe pas au lycée en Essonne.</strong> Tu peux la préparer <strong>en apprentissage</strong> : regarde les CFA ci-dessous. <button class="lien" data-guide="1">Comment ça marche ?</button></div>';
    if (f.specialite_bac) enc += '<div class="encadre appr"><strong>🤝 Bac pro en apprentissage.</strong> En apprentissage, tu prépares en général directement cette spécialité, sans passer par une 2de commune.</div>';
    if (acc.segpa) enc += '<div class="encadre segpa"><strong>✔ Prioritaire pour les élèves de SEGPA.</strong> Les élèves de 3e SEGPA, ULIS et EANA passent en priorité sur ce CAP.</div>';
    if (acc.profil2de) enc += '<div class="encadre profil"><strong>CAP « profil 2de pro ».</strong> Les élèves de 3e générale sont prioritaires. Pour un élève de SEGPA, la candidature passe par une <strong>commission spécifique</strong> : parles-en à ton professeur principal.</div>';
    if (acc.erea) enc += '<div class="encadre erea"><strong>EREA : procédure particulière.</strong> L\'entrée en EREA passe par une commission d\'affectation spécifique.</div>';
    var h = '<div class="fiche">' + enTete(etiquetteNiveau(f) + '<span class="etiquette">' + PICTOS[f.secteur] + ' ' + esc(f.secteur) + '</span>', f.nom) + enc +
      '<h3>Le métier</h3><p>' + esc(f.description) + '</p>' +
      '<h4>Au quotidien</h4><ul class="puces">' + f.quotidien.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>' +
      '<h4>Où travailler ?</h4><p>' + esc(f.lieux) + '</p>';
    if (f.famille && f.specialites.length) {
      h += '<div class="encadre info"><strong>Famille de métiers.</strong> La 2de pro est commune. À la fin de la 2de, tu choisis ta spécialité de bac pro parmi :<ul class="puces">' +
        f.specialites.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul><small>Toutes les spécialités ne sont pas proposées dans chaque lycée.</small></div>';
    }
    h += '<h3>Et après ?</h3><p>' + esc(f.apres) + '</p>' +
      '<p><a class="bouton-lien" href="' + esc(f.onisep) + '" target="_blank" rel="noopener">En savoir plus sur Onisep ↗</a></p>';
    var tri = function (a, b) { return etabs[a.etab].ville.localeCompare(etabs[b.etab].ville, 'fr'); };
    var sco = f.offres.filter(function (o) { return !estAppr(o); }).sort(tri);
    var app = f.offres.filter(estAppr).sort(tri);
    if (sco.length) {
      h += '<h3>🏫 Au lycée (' + sco.length + ')</h3>' + sco.map(function (o) {
        var e = etabs[o.etab];
        return '<div class="offre"><div class="offre-ligne"><div><button class="lien offre-lycee" data-lycee="' + e.id + '">' + esc(e.nom) + '</button>' + (o.acces === 'erea' ? ' <span class="etiquette erea">EREA</span>' : '') + '<div class="offre-ville">📍 ' + esc(e.ville) + '</div></div>' + badgeDemande(o.taux) + '</div>' +
          '<details><summary>Voir le détail</summary>' + o.places + ' places · taux de pression ' + D.annee + ' : <strong>' + tauxTexte(o.taux) + '</strong>' +
          (o.taux != null ? ' (environ ' + Math.round(o.taux * 10) / 10 + ' demande' + (o.taux >= 2 ? 's' : '') + ' en 1er vœu pour 1 place)' : '') +
          '<br><a href="' + esc(itineraire(e)) + '" target="_blank" rel="noopener">🚌 Itinéraire en transports</a></details></div>';
      }).join('');
    }
    if (app.length) {
      h += '<h3>🤝 En apprentissage (' + app.length + ')</h3>' +
        '<div class="encadre appr">Tu es salarié·e d\'une entreprise et tu vas au CFA. Pour entrer, il faut <strong>trouver une entreprise</strong>. <button class="lien" data-guide="1">Comment ça marche ?</button></div>' +
        app.map(function (o) {
          var e = etabs[o.etab];
          return '<div class="offre"><div class="offre-ligne"><div><button class="lien offre-lycee" data-lycee="' + e.id + '">' + esc(e.nom) + '</button>' + etiquetteType(e) + '<div class="offre-ville">📍 ' + esc(e.ville) + '</div></div>' + badgeOffre(o) + '</div>' +
            (o.voie === 'mfr' ? '<p class="note">Maison familiale rurale : alternance avec des stages, sous statut scolaire d\'après Onisep.</p>' : '') + '</div>';
        }).join('');
    }
    h += '</div>';
    ouvrir(h);
  }

  function ouvrirLycee(id) {
    var e = etabs[id]; if (!e) return;
    var lignes = [];
    D.formations.forEach(function (f) { f.offres.forEach(function (o) { if (o.etab === id) lignes.push({ f: f, o: o }); }); });
    lignes.sort(function (a, b) { return (estAppr(a.o) - estAppr(b.o)) || (a.f.niveau > b.f.niveau ? 1 : a.f.niveau < b.f.niveau ? -1 : 0) || a.f.nom.localeCompare(b.f.nom, 'fr'); });
    var libType = { EREA: 'EREA', CFA: "Centre de formation d'apprentis", MFR: 'Maison familiale rurale' }[e.type] || 'Lycée public';
    var h = '<div class="fiche">' + enTete('<span class="etiquette' + (e.type === 'CFA' || e.type === 'MFR' ? ' appr' : '') + '">' + libType + '</span>', e.nom) +
      (e.note ? '<p>' + esc(e.note) + '</p>' : '') +
      '<p class="adresse">📍 ' + esc(e.adresse) + (e.tel ? '<br>📞 <a href="tel:' + esc(e.tel.replace(/ /g, '')) + '">' + esc(e.tel) + '</a>' : '') + '</p>' +
      '<div class="actions">' +
      '<a class="bouton-lien principal" href="' + esc(itineraire(e)) + '" target="_blank" rel="noopener">🚌 Itinéraire en transports</a>' +
      (e.site ? '<a class="bouton-lien" href="' + esc(url(e.site)) + '" target="_blank" rel="noopener">Site du lycée ↗</a>' : '') +
      '<a class="bouton-lien" href="' + esc(e.onisep) + '" target="_blank" rel="noopener">Fiche Onisep ↗</a></div>' +
      '<div class="encadre info"><strong>Portes ouvertes.</strong> ' + esc(jpoTexte(e)) + '</div>' +
      (e.type === 'EREA' ? '<div class="encadre erea"><strong>EREA : procédure particulière.</strong> L\'entrée passe par une commission d\'affectation spécifique. Parles-en à ton professeur principal.</div>' : '') +
      (e.type === 'CFA' ? '<div class="encadre appr"><strong>🤝 Apprentissage.</strong> Pour entrer, il faut signer un contrat avec une entreprise. Le CFA peut t\'aider à en trouver une. <button class="lien" data-guide="1">Comment ça marche ?</button></div>' : '') +
      '<h3>Formations CAP et bac pro (' + lignes.length + ')</h3><ul class="liste-f">' +
      lignes.map(function (x) {
        return '<li><button data-formation="' + x.f.id + '">' + etiquetteNiveau(x.f, true) + '<span class="f-nom">' + esc(x.f.nom) + '</span>' + badgeOffre(x.o) + '</button></li>';
      }).join('') + '</ul></div>';
    ouvrir(h);
  }

  // ---- Évènements ---------------------------------------------------------
  function tout() {
    var info = $('#info-recherche');
    if (info) { info.hidden = !enRecherche(); info.innerHTML = enRecherche() ? '🔎 Ta recherche montre <strong>tout</strong> : au lycée et en apprentissage, CAP et bac pro. Clique sur un filtre pour revenir aux filtres.' : ''; }
    document.querySelectorAll('.niveaux').forEach(function (el) { el.classList.toggle('suspendu', enRecherche()); });
    $('#secteurs').hidden = enRecherche() || etat.vue === 'apprentissage';
    rendreSecteurs();
    if (etat.vue === 'metiers') rendreResultats();
    else if (etat.vue === 'lycees') rendreLycees();
    else if (etat.vue === 'carte') rendreCarte();
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-formation]'); if (t) { ouvrirFormation(t.getAttribute('data-formation')); return; }
    t = ev.target.closest('[data-lycee]'); if (t) { if (carte) carte.closePopup(); ouvrirLycee(t.getAttribute('data-lycee')); return; }
    if (ev.target.closest('[data-secteur],[data-niveau],[data-voie]') && etat.texte) { etat.texte = ''; $('#recherche').value = ''; }
    t = ev.target.closest('[data-secteur]'); if (t) { var s = t.getAttribute('data-secteur'); etat.secteur = etat.secteur === s ? null : s; tout(); return; }
    t = ev.target.closest('[data-niveau]');
    if (t) { etat.niveau = t.getAttribute('data-niveau'); document.querySelectorAll('[data-niveau]').forEach(function (b) { b.classList.toggle('actif', b === t); }); tout(); return; }
    t = ev.target.closest('[data-voie]');
    if (t) { var v = t.getAttribute('data-voie'); choisirVoie(etat.voie === v ? 'TOUTES' : v); tout(); return; }
    t = ev.target.closest('[data-voie-raccourci]');
    if (t) { choisirVoie('apprentissage'); etat.secteur = null; changerVue('metiers'); return; }
    t = ev.target.closest('[data-guide]');
    if (t) { fermerFiche(); changerVue('apprentissage'); return; }
    t = ev.target.closest('[data-aller]');
    if (t) { changerVue(t.getAttribute('data-aller')); var o = $('.onglets'); window.scrollTo({ top: o.getBoundingClientRect().top + window.scrollY - 12, behavior: 'smooth' }); return; }
    t = ev.target.closest('[data-vue]');
    if (t) { changerVue(t.getAttribute('data-vue')); return; }
    if (ev.target.closest('.fermer') || ev.target === $('#fiche')) { fermerFiche(); return; }
    if (ev.target.closest('#effacer')) {
      etat = { vue: etat.vue, niveau: 'TOUS', voie: 'TOUTES', secteur: null, texte: '', ville: '' };
      choisirVoie('TOUTES');
      $('#recherche').value = ''; $('#ville').value = '';
      document.querySelectorAll('[data-niveau]').forEach(function (b) { b.classList.toggle('actif', b.getAttribute('data-niveau') === 'TOUS'); });
      tout();
    }
  });
  function choisirVoie(v) {
    etat.voie = v;
    document.querySelectorAll('[data-voie]').forEach(function (b) { b.classList.toggle('actif', b.getAttribute('data-voie') === v); });
  }
  function changerVue(v) {
    etat.vue = v;
    document.querySelectorAll('[data-vue]').forEach(function (b) { var a = b.getAttribute('data-vue') === v; b.classList.toggle('actif', a); b.setAttribute('aria-selected', a); });
    ['metiers', 'lycees', 'carte', 'apprentissage'].forEach(function (x) { $('#vue-' + x).hidden = v !== x; });
    $('.outils').hidden = v === 'apprentissage';
    $('#secteurs').hidden = v === 'apprentissage';
    if (v !== 'apprentissage') $('#vue-' + v).prepend($('#secteurs'));
    tout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('#recherche').addEventListener('input', function (e) { etat.texte = e.target.value.trim(); tout(); });
  $('#ville').addEventListener('change', function (e) { etat.ville = e.target.value; tout(); });

  tout();
})();
