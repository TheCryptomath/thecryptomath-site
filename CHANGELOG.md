# Changelog

## Vague 1 — 28/09/2026

Pages HTML communes aux lots 1 et 2, ainsi qu'au changement de version CSS du lot 3 (20) : `404.html`, `build.html`, `connect.html`, `fr/404.html`, `fr/build/index.html`, `fr/contact/index.html`, `fr/index.html`, `fr/narrative-framework/index.html`, `fr/newsletter/index.html`, `fr/privacy/index.html`, `fr/resources/index.html`, `fr/score/index.html`, `fr/score/performance/index.html`, `index.html`, `narrative-framework.html`, `newsletter.html`, `privacy.html`, `resources.html`, `score/index.html`, `score/performance/index.html`.

| Lot | Fichiers modifiés | Changement | Commit |
| --- | --- | --- | --- |
| Lot 1 — U01/U02 | Les 20 pages HTML ci-dessus ; `css/styles.css` ; `score/performance.css` | Lien Newsletter dans le menu mobile, texte sombre des boutons orange, texte secondaire Performance lisible. Versions CSS actualisées. | `bdac14aa5958dd6f6f18c8a3b6c353fef9249fc5` |
| Lot 2 — G01 | Les 20 pages HTML ci-dessus ; `css/styles.css` ; `js/main.js` | Formulations d'identité FR/EN, descriptions Person, meta des accueils, masculin « narratif », nom Narrative Framework. Seuil du menu adapté au libellé long ; versions CSS/JS actualisées. | `eff5ac669f60e57af9535413516bbda82db0d309` |
| C04 | `score/index.html` ; `fr/score/index.html` ; `score/score.js` ; `score/score-loader.js` | Verdicts et explications du Score réécrits en langage d'observation ; messages de validation de saisie descriptifs. Aucun calcul ni seuil modifié. Versions JS actualisées. | `be5588171277e781f858c05ad850d536fc5e08bd` |
| Lot 3 — C01 | `newsletter.html` ; `fr/newsletter/index.html` ; `css/styles.css` ; les 18 autres pages HTML ci-dessus pour la version CSS | Nom public Lecture du Marché Crypto et bloc éditorial de l'édition #68. Ajustements de rendu à 320 px pour le menu, le CTA français et la date. | `06052db49821e1fcc0676d436cef815a2d0cc359` |

Les URL, `_redirects`, `robots.txt`, `sitemap.xml`, `llms.txt` et `llms-full.txt` n'ont pas été modifiés. Aucun déploiement, push ou PR.

## Vague 2A, 28/09/2026

| Lot | Changement |
| --- | --- |
| 1 — Narrative Framework v2 | Pages FR/EN : définition, version, ancrages 0/3/5, saturation séparée, bandes Noise/Watchlist/Active/Strong, zone de détection précoce et données structurées. `sitemap.xml` : seules les deux dates `lastmod` concernées passent au 28/09/2026. Commit `df1b52c`. |
| 2 — Menu | Liens du menu principal sans retour à la ligne ; espacement desktop ajusté. Nouvelle version de `css/styles.css` sur les 20 pages qui le chargent. Rapport QA complété. |

Aucun déploiement, push ou PR. Les URL, redirections, analyses historiques, calculs du Score et de Performance, ainsi que `llms.txt` restent inchangés.

### Passe de correction Vague 2A, 28/09/2026

- `9e8490c` - `Vague 2A: polish Framework copy and layout` : version courte dans la hero, note historique près du score, cartes supérieures de même largeur et tirets ASCII sur les deux pages Framework. CSS versionné sur les 20 pages qui le chargent.
- `Noindex internal markdown files` : ajout de `/*.md` avec `X-Robots-Tag: noindex` dans `_headers` ; retrait des chemins locaux de `QA_REPORT.md`. CSP inchangée.
