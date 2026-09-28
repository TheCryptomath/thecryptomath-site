# Rapport QA — Vague 1 — 28/09/2026

## Dépôt et verrou obligatoire

- Dépôt : `C:\Users\J\Documents\thecryptomath-site-repo`.
- Branche initiale : `main` ; HEAD de départ : `0349ddf4cd3bafbca518fdaa09fd0d5b56fa1175` ; `git status --short --branch` : propre (`## main...origin/main`).
- Branche de travail : `vague-1`, créée **après** validation de l'étape 0.
- Les 12 fichiers requis étaient présents : `index.html`, `fr/index.html`, les deux pages Performance, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `css/styles.css`, `score/performance.css`, `score/performance.js`, `score/score.js`.
- **Étape 0 validée.** L'archive auditée `C:\Users\J\Downloads\thecryptomath-site-main (88).zip` a le SHA-256 attendu `03051151C3F913B89ACC695EDCC511340D052389C58D54A6586716E916F670C1`. Les 37 fichiers texte de l'archive comparés au checkout sont identiques après normalisation CRLF/LF.
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
