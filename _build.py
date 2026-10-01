# Générateur du site Le Web du Coin — version 2 (inspiration agence-germain.fr, noir & mauve)
# Lancer : python _build.py   → régénère toutes les pages HTML et l'intro.
import os, json
OUT = os.path.dirname(os.path.abspath(__file__))
TEL, TEL_INT = "07 66 92 02 91", "+33766920291"
WA = "https://wa.me/33766920291?text=Bonjour%2C%20je%20souhaite%20des%20infos%20pour%20le%20site%20de%20mon%20commerce."
MAIL = "contact@lewebducoin.fr"
IG = "https://www.instagram.com/lewebducoin/"
SITE = "https://lewebducoin.fr"
NAV = [("index.html", "Accueil"), ("offres.html", "Offres"), ("realisations.html", "Réalisations"), ("a-propos.html", "À propos"), ("contact.html", "Contact")]
ZONES = ["Corbeil-Essonnes", "Villabé", "Ormoy", "Soisy-sur-Seine", "Étiolles", "Grigny", "Ris-Orangis", "Évry", "Saint-Germain-lès-Corbeil"]

# --- Intro : on injecte l'emblème en data URI (fonctionne aussi en ouvrant le fichier en local) ---
EMB_F = os.path.join(OUT, "_emblem_datauri.txt")
emb = open(EMB_F).read() if os.path.exists(EMB_F) else None
src = open(os.path.join(OUT, "assets/js/intro.src.js")).read()
if emb:
    open(os.path.join(OUT, "assets/js/intro.js"), "w").write(src.replace("__EMB__", emb))


def page(fname, title, desc, body, intro=False):
    cur = ' aria-current="page"'
    nav = "".join(f'<li><a href="{h}"{cur if h == fname else ""}>{t}</a></li>' for h, t in NAV)
    canon = SITE + "/" + ("" if fname == "index.html" else fname)
    intro_html = """<div id="intro" aria-hidden="true"><canvas></canvas><p class="intro-slogan">Du pavé au pixel</p><button class="intro-skip" type="button">Passer l'intro →</button></div>""" if intro else ""
    intro_js = '<script src="assets/js/intro.js"></script>' if intro else ""
    html = f"""<!doctype html>
<html lang="fr"{' class="intro-on"' if intro else ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/assets/img/og-image.jpg">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0A0911">
<link rel="icon" type="image/png" href="assets/img/favicon.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/dm-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfessionalService","name":"Le web du coin","slogan":"Du pavé au pixel","url":"{SITE}","telephone":"{TEL_INT}","email":"{MAIL}","areaServed":{json.dumps([{"@type": "City", "name": z} for z in ZONES[:6]], ensure_ascii=False)},"address":{{"@type":"PostalAddress","addressLocality":"Corbeil-Essonnes","postalCode":"91100","addressCountry":"FR"}},"sameAs":["{IG}"]}}</script>
</head>
<body>
{intro_html}
<a class="skip" href="#main">Aller au contenu</a>
<header class="header"><div class="wrap head-in">
  <a class="brand" href="index.html"><img src="assets/img/embleme.webp" alt="" width="54" height="39"><span>Le web du coin</span></a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="menu"><span></span><b class="sr">Menu</b></button>
  <nav aria-label="Menu principal"><ul class="nav" id="menu">{nav}<li class="nav-tel"><a href="tel:{TEL_INT}">{TEL}</a></li></ul></nav>
</div></header>
<main id="main">
{body}
</main>
<footer class="footer">
  <div class="band" aria-hidden="true"><div class="band-in">{" · ".join(ZONES * 2)} ·</div></div>
  <div class="wrap foot-in">
    <div><p class="foot-logo">Le web du coin</p><p class="hand">Du pavé au pixel</p></div>
    <div><p class="foot-h">Contact</p><p><a href="tel:{TEL_INT}">{TEL}</a><br><a href="mailto:{MAIL}">{MAIL}</a><br><a href="{IG}" rel="noopener">Instagram @lewebducoin</a></p></div>
    <div><p class="foot-h">Le site</p><p>{"<br>".join(f'<a href="{h}">{t}</a>' for h, t in NAV)}<br><a href="mentions-legales.html">Mentions légales</a></p></div>
  </div>
  <p class="wrap foot-copy">© 2026 Le web du coin · Sites internet pour les commerces et artisans de Corbeil-Essonnes et alentours</p>
</footer>
<a class="fab" href="{WA}" aria-label="Écrire sur WhatsApp" rel="noopener">💬</a>
{intro_js}
<script src="assets/js/main.js"></script>
</body>
</html>
"""
    open(os.path.join(OUT, fname), "w", encoding="utf-8").write(html)


def page_hero(kicker, title, lead=""):
    return f"""<section class="phero"><canvas class="pixels" data-density="14000" aria-hidden="true"></canvas><div class="wrap">
  <p class="kicker" data-r="up">{kicker}</p>
  <h1 class="split">{title}</h1>
  {f'<p class="lead" data-r="up" style="--d:.3s">{lead}</p>' if lead else ''}
</div></section>"""


CTA = f"""<section class="cta"><canvas class="pixels" data-density="16000" aria-hidden="true"></canvas><div class="wrap">
  <p class="hand big" data-r="up">On en parle ?</p>
  <h2 class="split xl">Autour<br>d'un café</h2>
  <p class="lead" data-r="up" style="--d:.2s">Je passe dans votre boutique, on regarde ensemble ce dont vous avez besoin. Sans engagement.</p>
  <div class="btns" data-r="up" style="--d:.35s"><a class="btn btn-main" href="tel:{TEL_INT}">Appeler le {TEL}</a><a class="btn btn-line" href="{WA}" rel="noopener">WhatsApp</a></div>
</div></section>"""

OFFRES = [
    ("Vitrine", "290", "Pour être trouvé et joignable", ["Une page claire : activité, horaires, adresse, plan", "Bouton d'appel et itinéraire en un clic", "Adapté au téléphone", "Fiche Google mise en lien", "Mise en ligne sous 2 semaines"], False, "L'essentiel pour exister en ligne"),
    ("Vitrine + produits", "490", "Pour montrer ce que vous vendez", ["Tout le contenu de la formule Vitrine", "Jusqu'à 5 pages (carte, produits, galerie…)", "Photos de vos produits ou réalisations", "Formulaire ou bouton WhatsApp", "Mise en ligne sous 3 semaines"], True, "La plus demandée"),
    ("Commande en ligne", "790", "Pour vendre ou réserver en ligne", ["Tout le contenu de la formule Vitrine + produits", "Catalogue avec prix", "Commande ou réservation en ligne", "Paiement sécurisé (selon la solution choisie)", "Mentions légales et CGV à jour"], False, "Pour aller plus loin"),
]
PROJETS = [
    ("Ugo Loc 91", "Location de matériel · Essonne", "Site vitrine avec présentation des produits à louer.", "https://ugoloc91.netlify.app/", "real-ugoloc.jpg", -3),
    ("Poème de fleurs", "Fleuriste artisan · Corse", "Site vitrine pour présenter des créations et être contacté facilement.", "https://poemedefleurs.netlify.app/", "real-poeme.jpg", 2),
    ("Orientation 91", "Outil pédagogique", "Outil en ligne pour aider des élèves à préparer leur orientation.", "https://orientation91.fr/", "real-orientation.jpg", -1.5),
]


def offre_cards(detail=False):
    out = ""
    for i, (n, p, s, items, v, b) in enumerate(OFFRES):
        lis = "".join(f"<li>{x}</li>" for x in items) if detail else ""
        out += f"""<article class="offre{' vedette' if v else ''}" data-r="up" style="--d:{i * .12}s">
  <p class="offre-n">0{i + 1}</p><p class="badge">{b}</p><h3>{n}</h3>
  <p class="prix"><small>à partir de</small> {p} €</p><p class="offre-s">{s}</p>{f'<ul>{lis}</ul>' if detail else ''}
  <a class="lnk" href="{'contact.html' if detail else 'offres.html'}">{'Demander un devis' if detail else 'Voir le détail'} →</a></article>"""
    return out


def polaroids():
    return "".join(f"""<a class="pola" href="{url}" target="_blank" rel="noopener" data-r="zoom" style="--d:{i * .15}s;--rot:{r}deg">
  <img src="assets/img/{img}" alt="Aperçu du site {n}" loading="lazy" width="960" height="600"><span class="hand">{n}</span><small>{tag}</small></a>"""
                   for i, (n, tag, d, url, img, r) in enumerate(PROJETS))


def index():
    body = f"""
<section class="hero">
  <canvas class="pixels" aria-hidden="true"></canvas>
  <div class="hero-in wrap">
    <p class="kicker" data-r="up">Le web du coin · Corbeil-Essonnes</p>
    <h1 class="split mega">Du pavé<br>au pixel</h1>
    <p class="hand hero-hand" data-r="up" style="--d:.45s">Des sites internet pour les commerces du coin</p>
  </div>
  <a class="scroll-hint" href="#intro-txt" aria-label="Descendre"><span></span></a>
</section>

<section class="duo" id="intro-txt"><div class="wrap duo-in">
  <div class="duo-txt">
    <h2 class="split md">Le web du coin<br>sites internet<br>91 Essonne</h2>
    <p data-r="up" style="--d:.15s">Je crée des sites simples, beaux et efficaces pour les commerçants et artisans du quartier. Et je m'occupe de tout, même après la mise en ligne.</p>
    <p data-r="up" style="--d:.25s">Vos clients vous cherchent d'abord sur leur téléphone. Quand on tape « boulangerie Corbeil » ou « coiffeur près de moi », ce sont les commerces avec un site et une fiche Google soignée qui sortent en premier.</p>
    <div class="btns" data-r="up" style="--d:.35s"><a class="btn btn-main" href="offres.html">Voir les offres</a><a class="btn btn-line" href="tel:{TEL_INT}">{TEL}</a></div>
  </div>
  <div class="duo-pics">
    <figure class="pic pic-a" data-p=".08" data-rot="-4"><img src="assets/img/banniere.jpg" alt="Une rue pavée dont les pavés se transforment en pixels" loading="lazy" width="1920" height="800"></figure>
    <figure class="pic pic-b" data-p="-.06" data-rot="3"><img src="assets/img/real-poeme.jpg" alt="Aperçu d'un site réalisé : Poème de fleurs" loading="lazy" width="960" height="600"></figure>
  </div>
</div></section>

<section class="stack-sec"><div class="wrap">
  <ul class="stack" aria-label="Ce que je fais pour vous">
    <li>Site vitrine</li><li>Fiche Google</li><li>Commande en ligne</li><li>Visibilité locale</li><li>Mises à jour</li><li>Suivi mensuel</li>
  </ul>
</div></section>

<section class="steps-sec"><div class="wrap">
  <figure class="pola pola-solo" data-r="zoom" style="--rot:-3deg"><img src="assets/img/embleme.webp" alt="Emblème Le web du coin : des pavés qui deviennent des pixels" loading="lazy" width="900" height="650"><span class="hand">Simple, et sans jargon</span></figure>
  <ol class="steps">
    <li class="st st1" data-r="up"><h3>1. On se rencontre</h3><p>Je viens dans votre commerce. Vous me parlez de votre activité, je vous écoute.</p></li>
    <li class="st st2" data-r="up"><h3>2. Je vous montre une maquette</h3><p>Vous voyez à quoi ressemblera votre site avant de vous engager.</p></li>
    <li class="st st3" data-r="up"><h3>3. Je le mets en ligne</h3><p>Nom de domaine, hébergement, Google : je m'occupe de toute la partie technique.</p></li>
    <li class="st st4" data-r="up"><h3>4. Je reste là</h3><p>Nouveaux horaires, nouveau produit, fermeture exceptionnelle : un message, et je mets à jour.</p></li>
  </ol>
</div></section>

<section class="why"><div class="wrap">
  <h2 class="split lg">Vos clients vous<br>cherchent d'abord<br>sur leur téléphone</h2>
  <div class="why-grid">
    <div data-r="up"><p class="why-n">01</p><h3>Être trouvé</h3><p>Ce sont les commerces avec un site qui apparaissent en premier dans les recherches.</p></div>
    <div data-r="up" style="--d:.12s"><p class="why-n">02</p><h3>Ouvert 24h/24</h3><p>Horaires, prix, carte, photos : vos clients ont la réponse même quand le rideau est baissé.</p></div>
    <div data-r="up" style="--d:.24s"><p class="why-n">03</p><h3>Rassurer</h3><p>Un site propre donne confiance. C'est souvent ce qui fait choisir votre boutique plutôt que celle d'à côté.</p></div>
  </div>
</div></section>

<section class="offres-sec"><div class="wrap">
  <div class="sec-head"><h2 class="split lg">Trois formules<br>des prix clairs</h2><p data-r="up">+ suivi mensuel à partir de 29 €/mois : hébergement, mises à jour, petites modifications.</p></div>
  <div class="offres">{offre_cards()}</div>
</div></section>

<section class="reals"><div class="wrap">
  <div class="sec-head"><h2 class="split lg">Déjà<br>en ligne</h2><p data-r="up">Un loueur de matériel, une fleuriste, un outil d'orientation : chaque projet est différent.</p></div>
  <div class="polas">{polaroids()}</div>
  <p class="center" data-r="up"><a class="btn btn-line" href="realisations.html">Toutes les réalisations</a></p>
</div></section>
{CTA}"""
    page("index.html", "Le web du coin — Création de sites internet pour commerces à Corbeil-Essonnes",
         "Sites internet simples et efficaces pour les commerçants et artisans de Corbeil-Essonnes et alentours. Création, mise en ligne et suivi. Du pavé au pixel.", body, intro=True)


def offres():
    body = page_hero("Offres & tarifs", "Des prix clairs<br>sans mauvaise<br>surprise",
                     "Chaque commerce est différent : les prix ci-dessous sont des points de départ. Je vous remets toujours un devis précis avant de commencer.") + f"""
<section class="offres-sec"><div class="wrap">
  <div class="offres detail">{offre_cards(True)}</div>
  <div class="encart" data-r="up"><h3>Offre de lancement : 5 premiers clients</h3>
    <p>Pour les 5 premiers commerces qui me font confiance : <strong>-30 % sur la création du site</strong>. En échange, je vous demande un avis Google et l'autorisation de présenter votre site dans mes réalisations.</p></div>
</div></section>
<section class="duo"><div class="wrap duo-in">
  <div class="duo-txt"><h2 class="split md">Suivi mensuel<br>dès 29 € / mois</h2>
    <p data-r="up">Un site qu'on ne met jamais à jour, c'est comme une vitrine poussiéreuse. Avec le suivi, vous n'avez rien à gérer.</p></div>
  <ul class="checks" data-r="up">
    <li>Hébergement et nom de domaine</li><li>Modifications courantes (horaires, prix, photos, fermetures)</li>
    <li>Sauvegardes et sécurité</li><li>Vérification régulière que tout fonctionne</li><li>Un interlocuteur joignable, près de chez vous</li></ul>
</div></section>
<section class="faq"><div class="wrap">
  <h2 class="split lg">Vous vous<br>demandez peut-être</h2>
  <div class="faq-grid">
    <details data-r="up"><summary>Combien de temps pour avoir mon site ?</summary><p>En général 2 à 4 semaines, selon la formule et le temps de rassembler vos textes et photos.</p></details>
    <details data-r="up"><summary>Je n'y connais rien, c'est grave ?</summary><p>Pas du tout. C'est justement mon rôle : vous me parlez de votre commerce, je m'occupe du reste.</p></details>
    <details data-r="up"><summary>Est-ce que je peux modifier le site moi-même ?</summary><p>Avec le suivi mensuel, vous m'envoyez un message et je fais les modifications pour vous. Vous gardez votre temps pour vos clients.</p></details>
    <details data-r="up"><summary>Le site m'appartient-il ?</summary><p>Oui. Le nom de domaine est à votre nom et vous gardez vos contenus, même si vous arrêtez le suivi.</p></details>
  </div>
</div></section>
{CTA}"""
    page("offres.html", "Offres et tarifs — Le web du coin", "Création de site vitrine à partir de 290 €, site avec produits à partir de 490 €, commande en ligne à partir de 790 €. Suivi mensuel à partir de 29 €/mois.", body)


def realisations():
    cards = "".join(f"""<article class="real" data-r="up" style="--d:{i * .1}s"><a class="pola" href="{url}" target="_blank" rel="noopener" style="--rot:{r}deg"><img src="assets/img/{img}" alt="Aperçu du site {n}" loading="lazy" width="960" height="600"><span class="hand">{n}</span></a>
<div><p class="kicker">{tag}</p><h3>{n}</h3><p>{d}</p><a class="lnk" href="{url}" target="_blank" rel="noopener">Voir le site →</a></div></article>"""
                    for i, (n, tag, d, url, img, r) in enumerate(PROJETS))
    body = page_hero("Réalisations", "Des sites<br>pour des gens<br>d'ici",
                     "Chaque site est pensé pour son activité : une fleuriste ne se présente pas comme un loueur de matériel.") + f"""
<section class="reals-list"><div class="wrap">{cards}</div></section>
{CTA}"""
    page("realisations.html", "Réalisations — Le web du coin", "Exemples de sites internet créés par Le web du coin pour des commerces et projets de l'Essonne.", body)


def apropos():
    body = page_hero("À propos", "Bonjour,<br>moi c'est David") + f"""
<section class="duo"><div class="wrap duo-in">
  <div class="duo-txt">
    <p class="lead" data-r="up">J'habite Corbeil-Essonnes et je crée des sites internet pour les artisans, commerçants et petites entreprises du coin.</p>
    <p data-r="up" style="--d:.1s">Avant ça, j'ai travaillé sur les chantiers comme coffreur, puis comme responsable technique. Je connais vos journées : les devis le soir, le téléphone qui sonne en pleine intervention, pas le temps de s'occuper d'internet. C'est pour ça que je fais simple.</p>
  </div>
  <div class="duo-pics"><figure class="pola pola-solo" data-r="zoom" style="--rot:3deg"><img src="assets/img/embleme.webp" alt="Emblème Le web du coin : des pavés qui deviennent des pixels" width="900" height="650"><span class="hand">Du pavé au pixel</span></figure></div>
</div></section>
<section class="why"><div class="wrap">
  <div class="why-grid two">
    <div data-r="up"><p class="why-n">01</p><h3>Ce que je vous propose</h3><p>Un site clair, qui vous ressemble, où vos futurs clients comprennent en quelques secondes ce que vous faites, où vous intervenez et comment vous joindre.</p></div>
    <div data-r="up" style="--d:.12s"><p class="why-n">02</p><h3>Comment je travaille</h3><p>Je passe vous voir, on discute de votre métier, je m'occupe de tout. Pas de jargon, pas de contrat illisible. Et si quelque chose doit changer sur votre site, vous m'appelez : vous ne tombez pas sur une plateforme.</p></div>
  </div>
  <p class="quote" data-r="up">Les commerces du quartier méritent le même sérieux que les grandes enseignes, avec un interlocuteur qu'on peut croiser en vrai.</p>
</div></section>
{CTA}"""
    page("a-propos.html", "À propos — Le web du coin", "David, créateur de sites internet à Corbeil-Essonnes pour les artisans, commerçants et petites entreprises du coin. Un interlocuteur local qui passe vous voir.", body)


def contact():
    body = page_hero("Contact", "Parlons de<br>votre commerce",
                     "Appelez-moi, écrivez-moi sur WhatsApp ou par mail : je réponds rapidement. Je me déplace à Corbeil-Essonnes et dans les communes voisines.") + f"""
<section class="contact-sec"><div class="wrap">
  <ul class="contact-list">
    <li data-r="up"><a href="tel:{TEL_INT}"><small>Appel direct</small>{TEL}</a></li>
    <li data-r="up" style="--d:.08s"><a href="{WA}" rel="noopener"><small>Un message, une photo de votre vitrine : on démarre comme ça</small>WhatsApp</a></li>
    <li data-r="up" style="--d:.16s"><a href="mailto:{MAIL}"><small>Par e-mail</small>{MAIL}</a></li>
    <li data-r="up" style="--d:.24s"><a href="{IG}" rel="noopener"><small>Les réalisations sur Instagram</small>@lewebducoin</a></li>
  </ul>
  <div class="zone" data-r="up"><p class="kicker">Zone d'intervention</p><p>Corbeil-Essonnes, Villabé, Ormoy, Soisy-sur-Seine, Étiolles, Grigny et alentours.</p></div>
</div></section>"""
    page("contact.html", "Contact — Le web du coin", "Contactez Le web du coin par téléphone, WhatsApp ou e-mail. Création de sites pour commerces à Corbeil-Essonnes et alentours.", body)


def mentions():
    body = page_hero("Informations", "Mentions<br>légales") + f"""
<section class="legal"><div class="wrap">
  <h2>Éditeur du site</h2>
  <p>Le web du coin — David Dos Santos, entrepreneur individuel (micro-entreprise).<br>
  SIRET : en cours d'immatriculation<br>
  Adresse : 91100 Corbeil-Essonnes<br>
  Téléphone : {TEL} — E-mail : <a href="mailto:{MAIL}">{MAIL}</a><br>
  Directeur de la publication : David Dos Santos.</p>
  <p>TVA non applicable, article 293 B du Code général des impôts.</p>
  <h2>Hébergement</h2>
  <p>GitHub, Inc. (service GitHub Pages) — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis — pages.github.com</p>
  <h2>Propriété intellectuelle</h2>
  <p>Les textes, visuels et le logo « Le web du coin » sont la propriété de leur auteur. Toute reproduction sans autorisation est interdite. Les aperçus des réalisations sont présentés avec l'accord des clients concernés.</p>
  <h2>Données personnelles</h2>
  <p>Ce site ne comporte pas de formulaire et ne dépose pas de cookies de suivi. L'intro animée mémorise seulement, le temps de votre visite et dans votre navigateur, qu'elle a déjà été vue. Si vous me contactez par téléphone, WhatsApp ou e-mail, vos coordonnées sont utilisées uniquement pour vous répondre et ne sont jamais transmises à des tiers. Vous pouvez demander leur suppression à tout moment à {MAIL}.</p>
</div></section>"""
    page("mentions-legales.html", "Mentions légales — Le web du coin", "Mentions légales du site lewebducoin.fr.", body)


def extras():
    page("404.html", "Page introuvable — Le web du coin", "Cette page n'existe pas.",
         page_hero("Erreur 404", "Perdu entre<br>deux pavés") + '<section class="legal center"><div class="wrap"><a class="btn btn-main" href="index.html">Retour à l\'accueil</a></div></section>')
    open(os.path.join(OUT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
    urls = "".join(f"<url><loc>{SITE}/{'' if h == 'index.html' else h}</loc></url>" for h, _ in NAV + [("mentions-legales.html", "")])
    open(os.path.join(OUT, "sitemap.xml"), "w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
    open(os.path.join(OUT, "CNAME"), "w").write("lewebducoin.fr\n")


for f in (index, offres, realisations, apropos, contact, mentions, extras):
    f()
print("ok")
