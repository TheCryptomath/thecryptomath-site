# Rapport QA — Vague 1 — 28/09/2026

## Dépôt et verrou obligatoire

- Dépôt : `repo local thecryptomath-site`.
- Branche initiale : `main` ; HEAD de départ : `0349ddf4cd3bafbca518fdaa09fd0d5b56fa1175` ; `git status --short --branch` : propre (`## main...origin/main`).
- Branche de travail : `vague-1`, créée **après** validation de l'étape 0.
- Les 12 fichiers requis étaient présents : `index.html`, `fr/index.html`, les deux pages Performance, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `css/styles.css`, `score/performance.css`, `score/performance.js`, `score/score.js`.
- **Étape 0 validée.** L'archive auditée `thecryptomath-site-main (88).zip` a le SHA-256 attendu `03051151C3F913B89ACC695EDCC511340D052389C58D54A6586716E916F670C1`. Les 37 fichiers texte de l'archive comparés au checkout sont identiques après normalisation CRLF/LF.
- Les 18 URL du `sitemap.xml` ont répondu HTTP 200. Les 16 HTML hors Contact correspondent au checkout après normalisation CRLF/LF. `connect.html` et `fr/contact/index.html` ne diffèrent qu'aux lignes d'obfuscation email Cloudflare : deux liens `mailto:`, le texte de l'adresse et l'insertion du script de décodage. Les valeurs obfusquées décodent en `admin@thecryptomath.com`. Aucune autre différence HTML n'a été neutralisée.
- Production et checkout identiques après normalisation CRLF/LF pour `robots.txt`, `sitemap.xml`, `css/styles.css`, `score/performance.css`, `score/performance.js` et `score/score.js` avant modification.

## Fichiers modifiés

Pages HTML : `404.html`, `build.html`, `connect.html`, `fr/404.html`, `fr/build/index.html`, `fr/contact/index.html`, `fr/index.html`, `fr/narrative-framework/index.html`, `fr/newsletter/index.html`, `fr/privacy/index.html`, `fr/resources/index.html`, `fr/score/index.html`, `fr/score/performance/index.html`, `index.html`, `narrative-framework.html`, `newsletter.html`, `privacy.html`, `resources.html`, `score/index.html`, `score/performance/index.html`.

Autres fichiers de code : `css/styles.css`, `score/performance.css`, `js/main.js`, `score/score.js`, `score/score-loader.js`. Documentation ajoutée : `CHANGELOG.md`, `QA_REPORT.md`. Aucune route ni règle de `_redirects` modifiée.

## Tests par lot

| Lot | Contrôles | Résultat |
| --- | --- | --- |
| Lot 1 | 32 rendus Playwright : accueils et Performance FR/EN, 320/390/420/768 px, thèmes clair/sombre ; menu, lien Newsletter, Tab, Escape, retour du focus, débordement. | Tous passent. Le CTA d'en-tête est masqué dans le menu mobile ; les CTA de hero et de footer restent présents. |
| Lot 2 | 72 rendus : accueils, Performance et Narrative Framework FR/EN, 320/390/420/768/1100/1180 px, deux thèmes. Douze contrôles supplémentaires de navigation à 769–1280 px. Relecture des variantes G01 de `AUDIT.md`, JSON-LD, CSP et versions CSS/JS. | Tous passent. Aucun nom de section « Cadre »/« Framework narratif » ni nom français `narrative(s)` ne reste dans les pages concernées ; les URL `narrative-framework` sont conservées. |
| C04 | 16 rendus Score FR/EN, 320/390/420/768 px, deux thèmes ; menu et clavier. Syntaxe de `score/score.js` et `score/score-loader.js` contrôlée. Diff limité aux traductions et au texte HTML ; le chargeur ne change que sa version d'asset. | Tous passent. Aucun calcul, score, seuil ou condition logique modifié. Les champs Entrée/Stop/TP et leurs règles de validation restent fonctionnels ; seuls leurs messages ont changé. |
| Lot 3 | 16 rendus Newsletter FR/EN, 320/390/420/768 px, deux thèmes ; titre, date, URL, CTA, menu, clavier et limites de viewport. Captures relues à 320 px sombre et 768 px clair. Après correction du menu et du CTA français à 320 px, 32 rendus transversaux accueil/Performance FR/EN ont été répétés. | Tous passent. Le bouton Menu est entièrement visible et le CTA français ne tronque plus son texte à 320 px. |

### Contrastes mesurés

- Texte `#0e0f12` sur bouton orange `#F7931A` : **8,34:1** dans les deux thèmes (couleurs calculées dans le navigateur).
- `.perf-card-sub` clair `#4a5160` sur fond effectif `#fbfbfc` : **7,70:1**.
- `.perf-card-sub` sombre `#a9acb6` sur fond effectif `#0f1013` : **8,39:1**.
- Les trois ratios dépassent 4,5:1 pour le texte normal.

### JSON-LD, CSP, Performance et versions

- Les **48 blocs JSON-LD** des 20 pages HTML ont été analysés sans erreur après modifications. Les descriptions Person FR/EN correspondent à la formulation officielle sur accueil, Build, Contact/Connect, Resources et Newsletter.
- Les **20 scripts inline de thème** conservent exactement `aWphpzk4Yp99ljnM7R/sJdN/7k247DXv8rS1lKb2t2I=` ; le hash figure toujours dans `_headers`. Aucun script de thème ni `_headers` modifié.
- Performance FR/EN : IDs `perfMeta`, `perfSummary`, `perfStats`, `perfStatsNote`, `perfTableBody` et les neuf IDs Telegram conservés ; cinq `data-summary`, trois `data-filter` conservés ; tableau principal à **14** colonnes, tableau Telegram à **9** ; aucun `perfSimulation` ni `data-sim-*`. `score/performance.js` et ses calculs restent inchangés.
- Versions finales : `css/styles.css?v=20260928-vague1-c01` sur les 20 pages ; `score/performance.css?v=20260928-vague1` sur les deux pages Performance ; `js/main.js?v=20260928-vague1-g01` sur les 20 pages ; `score/score-loader.js?v=20260928-c04` sur les deux pages Score ; le chargeur appelle `score/score.js?v=20260928-c04`. Aucune ancienne version de ces ressources ne reste sur une page qui les charge.

## Édition Newsletter vérifiée

- [Édition officielle #68](https://thecryptomath.substack.com/p/bitcoin-consolide-la-tokenisation) : HTTP 200, URL canonique identique, titre publié « Bitcoin consolide. La tokenisation change de catégorie. », ligne d'édition « Lecture du Marché Crypto #68 - 04 septembre 2026 ».
- Les courts extraits FR/EN résument les passages sur les actions tokenisées, Robinhood et l'infrastructure financière sans attribuer à cette édition une détection anticipée du narratif.
- Aucun lot sauté. Aucune nouvelle statistique, audience ou preuve sociale ajoutée.

## Vérifications à faire après déploiement

Le déploiement était exclu de cette mission. Un contrôle manuel sur le site publié reste nécessaire pour la propagation des versions CSS/JS, les deux liens vers l'édition, le menu sur appareil mobile réel et les réponses des API Score/Performance avec les nouveaux textes. La prévisualisation locale n'avait pas les API de production ; les calculs n'ont pas été modifiés.

## C04 — anciennes → nouvelles formulations

### `score/score.js`

- `noTrade: "No trade"`
  → `noTrade: "Unfavorable signal"`

- `A+ setup`
  → `Strong confluence`

- `Strong confluence. Risk-managed execution still required.`
  → `Several observed criteria align. This is a stronger research signal, with outcome still uncertain.`

- `Edge exists but risk is higher. Reduce size and keep stops tight.`
  → `Some criteria align, but conflicts and higher uncertainty make the signal ambiguous.`

- `Too much noise. Wait for better alignment.`
  → `Observed criteria do not align enough for a clear research signal in the current regime.`

- `Entry and Stop cannot be equal.`
  → `Entry and Stop values are equal; this scenario is invalid.`

- `For a long, Stop must be below Entry.`
  → `Long scenario invalid: Stop value is not below Entry.`

- `For a long, TP must be above Entry.`
  → `Long scenario invalid: TP value is not above Entry.`

- `For a short, Stop must be above Entry.`
  → `Short scenario invalid: Stop value is not above Entry.`

- `For a short, TP must be below Entry.`
  → `Short scenario invalid: TP value is not below Entry.`

- `noTrade: "Pas de trade"`
  → `noTrade: "Signal défavorable"`

- `Configuration A+`
  → `Confluence forte`

- `Confluence forte. Une exécution disciplinée et un risque maîtrisé restent indispensables.`
  → `Plusieurs critères observés convergent. Le signal de recherche est plus fort, sans résultat garanti.`

- `Il existe un avantage, mais le risque est plus élevé. Réduisez la taille et gardez des stops serrés.`
  → `Certains critères convergent, mais des divergences et une incertitude accrue rendent le signal ambigu.`

- `Trop de bruit. Attendez un meilleur alignement.`
  → `Les critères observés ne convergent pas assez pour former un signal de recherche clair dans le régime actuel.`

- `L’entrée et le stop ne peuvent pas être identiques.`
  → `Les valeurs d’entrée et de stop sont identiques ; ce scénario est invalide.`

- `Pour un long, le stop doit être sous l’entrée.`
  → `Scénario long invalide : le stop n’est pas sous l’entrée.`

- `Pour un long, le take profit doit être au-dessus de l’entrée.`
  → `Scénario long invalide : le take profit n’est pas au-dessus de l’entrée.`

- `Pour un short, le stop doit être au-dessus de l’entrée.`
  → `Scénario short invalide : le stop n’est pas au-dessus de l’entrée.`

- `Pour un short, le take profit doit être sous l’entrée.`
  → `Scénario short invalide : le take profit n’est pas sous l’entrée.`

### `score/index.html`

- `What does No trade mean?`
  → `What does an unfavorable signal mean?`

- `No trade means skip the setup and wait for better alignment or a better regime.`
  → `An unfavorable signal means the observed criteria do not align enough in the current regime.`

- `<h2 id="verdictTitle">No trade</h2>`
  → `<h2 id="verdictTitle">Unfavorable signal</h2>`

- `<strong>No trade</strong>`
  → `<strong>Unfavorable signal</strong>`

- `strong confluence. Good for intraday, swing, and position entries with risk control.`
  → `strong alignment across observed criteria. A stronger research signal; the outcome remains uncertain.`

- `some edge, higher noise. Reduce size, be stricter on execution.`
  → `partial alignment with conflicting criteria and greater uncertainty.`

- `skip. Wait for alignment or a better regime.`
  → `insufficient alignment. Current observations do not support a clear research signal.`

- `use this as a direction filter only. Confirm with your execution chart.`
  → `short-horizon directional context only; this score does not evaluate execution.`

- `use it as a structured research filter, then validate execution on your own chart.`
  → `an intraday confluence snapshot; execution quality remains outside this score.`

- `very good. Structure is intentionally strict to avoid chop.`
  → `stricter structural criteria can filter some market noise.`

- `use it for entries and adds. Re-run on regime shifts, not every day.`
  → `a broader context reading that can change as market regimes shift.`

- `Always manage risk.`
  → `Market risk remains present.`

### `fr/score/index.html`

- `Que signifie No trade ?`
  → `Que signifie un signal défavorable ?`

- `No trade signifie qu’il vaut mieux ignorer le setup et attendre un meilleur alignement ou un meilleur régime.`
  → `Un signal défavorable indique que les critères observés ne convergent pas assez dans le régime actuel.`

- `<h2 id="verdictTitle">Pas de trade</h2>`
  → `<h2 id="verdictTitle">Signal défavorable</h2>`

- `<strong>Pas de trade</strong>`
  → `<strong>Signal défavorable</strong>`

- `confluence forte. Bon pour les entrées intraday, swing et position avec contrôle du risque.`
  → `forte convergence des critères observés. Le signal de recherche est plus fort ; le résultat reste incertain.`

- `un certain edge, mais plus de bruit. Réduisez la taille, soyez plus strict sur l’exécution.`
  → `convergence partielle, avec des critères divergents et davantage d’incertitude.`

- `on passe. Attendez un meilleur alignement ou un meilleur régime.`
  → `alignement insuffisant. Les observations actuelles ne forment pas un signal de recherche clair.`

- `utilisez-le uniquement comme filtre directionnel. Confirmez avec votre graphique d’exécution.`
  → `contexte directionnel de court terme uniquement ; ce score n’évalue pas l’exécution.`

- `utilisez-le comme filtre de recherche structuré, puis validez l’exécution sur votre propre graphique.`
  → `lecture de confluence intraday ; la qualité d’exécution reste hors du score.`

- `très bon. La structure est volontairement stricte pour éviter le bruit.`
  → `critères structurels plus stricts qui peuvent filtrer une partie du bruit de marché.`

- `utilisez-le pour les entrées et renforcements. Relancez-le lors des changements de régime, pas chaque jour.`
  → `lecture de contexte plus large, susceptible de changer avec le régime de marché.`

- `Gérez toujours votre risque.`
  → `Le risque de marché reste présent.`

## Vague 2A, 28/09/2026

### Étape 0 et périmètre

- Dépôt : `repo local thecryptomath-site`. Départ sur `main`, état propre. `HEAD`, `origin/main` local et `git ls-remote origin refs/heads/main` : `453a9ccc6749f67572cf0be6414fce97707ebd81`.
- Les quatre fichiers ont été comparés à la production après normalisation CRLF/LF. Résultat : identiques. SHA-256 normalisés : `narrative-framework.html` `EDB27DC12CF3207A2BD7E2C13F577C8318E602C867F95F0CC80A1E8BFFC96E12` ; `fr/narrative-framework/index.html` `7E906F8D4B4E6D4853784752560AC9823ADB089F1B7D5D1FA5763DDD7D27DCDA` ; `css/styles.css` `DA5F1CBFB06B8404DB2EFC28AE4466013E548A4DD509D731ABB6D3745D30784F` ; `sitemap.xml` `7B44692EAC1AB19C480761BE59566AABAE817855D55552AFC224F8A4AADDB997`.
- Branche locale `vague-2a` créée après cette validation. Aucun fichier, branche ou commit créés avant le verrou.
- Lot 1 : seules les deux pages Narrative Framework et `sitemap.xml` ont changé. Lot 2 : `css/styles.css`, sa version dans les 20 pages HTML qui le chargent, `CHANGELOG.md` et ce rapport. Dans les pages Score et Performance, seul le paramètre `?v=` de la feuille CSS change ; contenu et calculs restent identiques.

### Contrôles

- Lot 1 : 28 rendus des pages FR/EN à 320, 390, 768, 1024, 1280, 1366 et 1440 px, en thèmes clair et sombre. Aucun débordement horizontal. Le menu desktop qui se repliait à 1280 px a été corrigé au lot 2.
- Lot 2 : les mêmes 28 rendus. Aucun débordement horizontal, chevauchement du menu avec le logo ou les boutons, ni retour à la ligne des liens desktop. Menu mobile ouvert à 320, 390, 768 et 1024 px dans les deux langues : sept liens présents et panneau dans le viewport.
- Les 21 ancrages français sont identiques mot pour mot au brief. Parité FR/EN : sept dimensions correspondantes, titres FR localisés et titres EN inchangés, trois ancrages 0/3/5 sous chacune, saturation, zone de détection et quatre bandes communes.
- Les contenus de méthode sont présents dans le HTML statique ; ils ne dépendent pas de JavaScript. Un essai manuel dans un navigateur avec JavaScript désactivé reste à faire.
- Les deux blocs JSON-LD modifiés ont été analysés sans erreur. `Article.dateModified` vaut `2026-09-28`, et la description mentionne v2. `DefinedTermSet` contient les sept dimensions, Saturation et la zone de détection. Les FAQ invisibles ont été retirées du balisage.
- Les scripts de thème inline gardent le hash SHA-256 `aWphpzk4Yp99ljnM7R/sJdN/7k247DXv8rS1lKb2t2I=`, présent dans `_headers`.
- `git diff --check` ne signale pas d’erreur. Aucun seuil historique ni ancienne analyse n’a été recalculé ou modifié.

### Ancrages anglais complets pour relecture

**Problem pressure**

- 0: No clearly identifiable problem. A solution looking for a problem.
- 3: A real, documented problem, but still confined to a niche or avoidable.
- 5: A structural, costly, recurring problem observed beyond a single crypto project, with concrete demand.

**Timing**

- 0: An essential condition is still missing, with no near-term path in sight.
- 3: Several conditions are in place, but an important dependency or trigger is still missing.
- 5: Essential conditions allow adoption now, with at least one concrete catalyst identifiable within 6 months. Regulation counts here only if relevant to the narrative.

**Liquidity path**

- 0: No liquid asset or proxy genuinely exposed to the narrative.
- 3: At least one liquid proxy exists, but its exposure is imperfect or its access and liquidity remain limited.
- 5: One or more liquid, accessible proxies provide sufficiently direct and deep exposure to track the thesis.

**Attention velocity**

- 0: Attention is flat, declining, or mainly sustained by the project itself.
- 3: Visible acceleration in specialist communities. Shared language is beginning to emerge.
- 5: Measurable acceleration from a still-low base, echoed by several independent groups over a defined recent period.

**Product proof**

- 0: A concept, announcement, or whitepaper. No real usage.
- 3: A usable product with real users, but usage is still low, concentrated, or heavily supported by incentives.
- 5: Recurring usage observed over multiple periods. Fees, revenue, retention, or developer activity show demand that does not mainly depend on incentives.

**Distribution surface**

- 0: The project and its investors are almost the only parties with an interest in spreading the topic.
- 3: Several independent channels exist, but distribution remains concentrated.
- 5: Several independent surfaces each have their own reason to spread the narrative, such as apps, infrastructure, exchanges, developers, creators, funds, and users.

**Asymmetry**

- 0: The favorable scenario already appears largely reflected in the valuations of exposed assets.
- 3: Some potential remains, but significant repricing has already occurred.
- 5: The thesis could still have a substantial impact relative to current valuations, and most relevant proxies have not yet reacted strongly.

### Bandes anglaises complètes pour relecture

- 0–10, **Noise**: Signal is too weak, too vague, or mainly promotional.
- 11–20, **Watchlist**: Interesting elements are emerging, but the evidence, timing, or structure remain insufficient.
- 21–28, **Active**: The narrative is sufficiently supported to warrant in-depth research and regular monitoring.
- 29–35, **Strong**: Strong convergence across observed dimensions; a research priority.
- Strong implies neither high upside potential nor an opportunity to buy.

### Formulations éditoriales réécrites

| Avant | Après |
| --- | --- |
| EN : “The key question becomes entry quality.” (ancienne bande Crowded) | Phrase supprimée avec l’ancienne bande ; Strong décrit une priorité de recherche. |
| FR : “La vraie question devient la qualité d’entrée.” (ancienne bande Saturé) | Phrase supprimée avec l’ancienne bande ; Strong décrit une priorité de recherche. |
| EN : “the easy part of the trade may already be gone.” | “most of the discovery may already have happened.” |
| FR : “la partie facile du mouvement est souvent déjà passée.” | “l’essentiel de la découverte a peut-être déjà eu lieu.” |
| EN : “The total gives a research signal, not a buy signal.” | “The total sets a research priority.” |
| FR : “Le total donne un signal de recherche, pas un signal d’achat.” | “Le total fixe une priorité de recherche.” |
| EN : “a more structured setup view.” | “a more structured view of market context.” |
| FR : “une lecture plus structurée des setups.” | “une lecture plus structurée du contexte de marché.” |

### Formulations tranchées dans la passe finale

- Asymétrie : pilule FR « Valorisation », pilule EN « Valuation » ; question et description structurée EN reformulées sans « upside ». Les ancrages restent identiques.
- « Aucun chemin de liquidité » / « No liquidity path » : formulation plus précise sur la difficulté d’exposer la thèse via des marchés liquides.

### Vérifications manuelles restantes

- Ouvrir les deux pages dans un navigateur avec JavaScript désactivé pour confirmer la lecture complète, puis sur appareils mobiles réels pour apprécier la longueur des nouveaux blocs.
- Après publication par le propriétaire du site, vérifier les deux URL, la propagation du nouveau `?v=` CSS, le menu, les dates du sitemap et le rendu des deux thèmes. Aucun déploiement, push ou PR effectué ici.

### Passe de correction Vague 2A, 28/09/2026

- Commit éditorial et visuel : `9e8490c` (`Vague 2A: polish Framework copy and layout`). Hero réduite à la date v2, note méthodologique près du score, cartes grises de largeur identique, tirets ASCII dans les deux pages, version CSS renouvelée sur 20 pages.
- Commit des fichiers internes : `Noindex internal markdown files`. Règle Markdown ajoutée à `_headers` et chemins locaux retirés de ce rapport. Les anciennes règles et la CSP sont inchangées.
- Contrôle navigateur : 28 rendus FR/EN aux largeurs 320, 390, 768, 1024, 1280, 1366 et 1440 px, dans les thèmes clair et sombre. Écart de largeur des deux cartes supérieures : 0 px à chaque rendu. Aucun débordement horizontal ni chevauchement du menu.
- JSON-LD FR/EN analysé sans erreur. `—` : 0 ; `–` : 0 dans chacune des deux pages, données structurées comprises. Hash des deux scripts de thème inchangé : `aWphpzk4Yp99ljnM7R/sJdN/7k247DXv8rS1lKb2t2I=`.
- Le motif `/*.md` couvre les URL Markdown de la racine et des sous-dossiers ; les URL `.html` ne reçoivent pas `X-Robots-Tag` par cette règle. Vérification locale de la correspondance selon la syntaxe Cloudflare Pages. La réponse HTTP réelle reste à vérifier après publication.

Contrôle de complétude : PASS

1. Définition en deux phrases : thèse partagée et acteurs indépendants qui emploient le même vocabulaire, construisent des produits et orientent du capital.
2. Score total : solidité comme sujet de recherche ; ni potentiel de prix ni précocité.
3. Timing 5 : la régulation ne compte que si elle est pertinente pour le narratif.
4. Attention velocity 5 : une période récente définie figure dans les deux langues.
5. Saturation Low : mention des moteurs IA interrogés sur les narratifs du moment.
6. Réponses des moteurs IA : indicateur parmi d’autres, protocole comparable et daté.
7. Chaque analyse publie les observations qui justifient son niveau de saturation.
8. Distinction complète : Vitesse de l'attention mesure la vitesse de montée ; Saturation, la diffusion déjà atteinte ; Asymétrie, ce qui est intégré dans les valorisations.

### Passe finale locale Vague 2A, 28/09/2026

Branche vérifiée avant la passe : `vague-2a`, état propre. Les 28 rendus FR/EN à 320, 390, 768, 1024, 1280, 1366 et 1440 px en thèmes clair et sombre sont terminés : aucun débordement horizontal ni chevauchement du menu ; écart de largeur entre la réponse rapide, la citation et la carte finale : 0 px. Menus mobiles ouverts aux quatre premières largeurs : sept liens présents et panneau dans le viewport. Les contenus sont dans le HTML initial et ne dépendent pas de JavaScript pour être présents ; un essai visuel avec JavaScript explicitement désactivé reste à faire.

Les 21 ancrages FR sont identiques à `HEAD`. Les 21 ancrages EN ne diffèrent que par la suppression de l'espace avant le deux-points. Les descriptions des sept dimensions dans le JSON-LD FR restent inchangées, ainsi que les termes Saturation et zone de détection FR/EN. Les bandes, plages, seuil de 21 avec Low, qualification 18-20 avec Low et notes sur les analyses antérieures sont inchangés. Les JSON-LD FR/EN sont analysables. Les scripts de thème gardent leur hash SHA-256 `aWphpzk4Yp99ljnM7R/sJdN/7k247DXv8rS1lKb2t2I=` ; `_headers`, sa CSP et sa règle Markdown sont identiques à `HEAD`. `sitemap.xml`, `_redirects`, les calculs Score et les autres fichiers protégés restent inchangés. La version CSS `20260928-vague2a-final` est présente sur les 20 pages concernées ; aucune ancienne référence `vague2a-polish` ne subsiste.

| # | Instruction | Statut | Fichier(s) | Preuve |
|---|---|---|---|---|
| 1 | Titres des sept dimensions FR | FAIT | `fr/narrative-framework/index.html` | `<h3>Pression du problème</h3>`, `<h3>Timing</h3>`, `<h3>Chemin de liquidité</h3>`, `<h3>Vitesse de l'attention</h3>`, `<h3>Preuve produit</h3>`, `<h3>Surface de distribution</h3>`, `<h3>Asymétrie</h3>` |
| 2 | Carte finale pleine largeur FR/EN | FAIT | `css/styles.css`, deux pages Framework | `.framework-next-step { width: 100%; max-width: none; }` ; `class="answer-block framework-next-step"` |
| 3 | Réponse rapide FR | FAIT | `fr/narrative-framework/index.html` | `Le Narrative Framework évalue un narratif crypto selon sept dimensions.` ; `Pression du problème (Problem pressure), Timing, Chemin de liquidité (Liquidity path), Vitesse de l'attention (Attention velocity), Preuve produit (Product proof), Surface de distribution (Distribution surface) et Asymétrie (Asymmetry).` ; `Ce n'est pas une machine à prédire. Il sert à structurer une thèse, comparer les signaux et éviter de confondre conviction et consensus tardif.` |
| 4 | Quick answer EN | FAIT | `narrative-framework.html` | `The Narrative Framework evaluates a crypto narrative across seven dimensions.` ; `Problem pressure, Timing, Liquidity path, Attention velocity, Product proof, Distribution surface, and Asymmetry.` ; `It is not a prediction machine. It structures a thesis, compares signals, and helps distinguish conviction from late consensus.` |
| 5 | Asymétrie et Asymmetry | FAIT | deux pages Framework | `<span class="framework-pill">Valorisation</span>` ; `<span class="framework-pill">Valuation</span>` ; `Is meaningful potential still left relative to how obvious, crowded, and priced-in the narrative already is?` ; `The remaining potential relative to how obvious, crowded, and priced-in the narrative already is.` |
| 6 | Piège du chemin de liquidité FR/EN | FAIT | deux pages Framework | `Une idée forte sans chemin pratique pour le capital peut rester intellectuellement convaincante, mais difficile à traduire en exposition sur des marchés liquides.` ; `A strong idea with no practical path for capital to enter can remain intellectually compelling but difficult to express through liquid markets.` |
| 7 | Ponctuation des 21 ancrages EN | FAIT | `narrative-framework.html` | `<strong>0</strong>:`, `<strong>3</strong>:`, `<strong>5</strong>:` ; 21 libellés comparés à `HEAD` |
| 8 | Capitales des quatre bandes EN | FAIT | `narrative-framework.html` | `Signal is too weak, too vague, or mainly promotional.` ; `Interesting elements are emerging, but the evidence, timing, or structure remain insufficient.` ; `The narrative is sufficiently supported to warrant in-depth research and regular monitoring.` ; `Strong convergence across observed dimensions; a research priority.` |
| 9 | Invariants et périmètre | FAIT | deux pages Framework, `_headers` | `Early Detection Zone: a total score of at least 21 and Low saturation.` ; `X-Robots-Tag: noindex` ; `Analyses published before September 28, 2026 retain their original methodology and are not retrospectively rescored.` |
| 10 | Termes anglais secondaires et JSON-LD FR | FAIT | `fr/narrative-framework/index.html`, `css/styles.css` | `<h3>Pression du problème</h3><span class="framework-term-en" lang="en">Problem pressure</span>` ; `"name": "Pression du problème"` ; `"alternateName": "Problem pressure"` ; `<h3>Timing</h3><p class="card-desc">` ; `Vitesse de l'attention mesure à quelle vitesse l'attention monte. Saturation mesure jusqu'où elle s'est déjà propagée. Asymétrie porte sur ce qui est déjà intégré dans les valorisations.` |
| 11 | Tableau et contrôles finaux | FAIT | `QA_REPORT.md` | `0 tiret cadratin : PASS` ; `JSON-LD FR : PASS` ; `X-Robots-Tag Markdown inchangé : PASS` |

0 tiret cadratin : PASS
0 tiret demi-cadratin : PASS
JSON-LD FR : PASS
JSON-LD EN : PASS
CSP/hash : PASS
Responsive 320/390/768/1024/1280/1366/1440 : PASS
Parité méthodologique FR/EN : PASS
X-Robots-Tag Markdown inchangé : PASS

`git diff --check` : PASS. Les fichiers modifiés de cette passe sont les deux pages Framework, `css/styles.css`, les 18 autres HTML qui chargent cette feuille, `QA_REPORT.md` et `CHANGELOG.md`.
