# Eat Smart, Feel Great! — "The Table"

Interactive web presentation for the 5th year English project *Wellness Experience: Small Changes, Big Differences* (Escuela Modelo de San Juan) — Team 2, Healthy Eating.

Static site: HTML + CSS + plain JavaScript. No frameworks, no build step, no internet needed (fonts, images and the QR library are local). It also works by double-clicking `index.html`.

## Keyboard shortcuts (presentation mode)

| Key | Action |
| --- | --- |
| → / Space / Page Down | Next scene |
| ← / Shift + Space / Page Up | Previous scene |
| Home / End | First / last scene |
| F | Fullscreen on / off |
| N | Show / hide the speaker notes |
| Esc | Close the game or the Sources window |

- Swipe left / right also changes scene on a touch screen.
- Each scene has its own address: `#1` … `#9`. `#game` opens the game directly (this is what the QR code uses).
- Inside the game, the small ↻ button shows the "how to play" demo again. In the supermarket, walk along the aisle with the mouse wheel, by dragging, or with the round arrow buttons.
- The arrows only change scenes. Everything inside a scene is activated with a click or a tap.
- The two small buttons in the top-right corner (notes and fullscreen) hide after 3 seconds without moving the mouse.
- On a phone (narrow or vertical screen) the scenes are shown one under the other.

## Where things are

| File | What it has |
| --- | --- |
| `js/content.js` | **All the texts**, speaker notes and sources. Edit texts here. |
| `js/app.js` | Scenes, navigation, notes, fullscreen, progress plate, QR, Sources window |
| `js/scenes.js` | Drawings and the interactions of every scene (the travelling plate) |
| `js/game.js` | The game (supermarket → lunch → snack → result) and its "how to play" demo |
| `css/styles.css` | All the design |
| `assets/food/` | Food pictures |
| `fonts/` | Font files |
| `vendor/qrcode.js` | QR code library |

## Credits

- **Food and object pictures:** [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (3D style), © Microsoft Corporation, MIT License — see `assets/food/LICENSE.txt`. `bowl_of_oats.png` is the Fluent "Bowl with spoon" picture with oats painted inside for this project.
- **Bricolage Grotesque** by Mathieu Triay — SIL Open Font License 1.1 — see `fonts/OFL-BricolageGrotesque.txt`.
- **Atkinson Hyperlegible** by the Braille Institute of America — SIL Open Font License 1.1 — see `fonts/OFL-AtkinsonHyperlegible.txt`.
- **QR Code Generator for JavaScript** (`qrcode-generator` 1.4.4) by Kazuhiko Arase — MIT License (notice inside `vendor/qrcode.js`). "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
- Plate, cutlery, glasses, water bottle, tray, paper bag, supermarket shelves, battery, sprout, heart, notebook, bowl, tablecloth and desk are drawn with CSS/SVG in this project.

## Sources of the information

- Ministerio de Salud de la Nación – Guías Alimentarias para la Población Argentina (GAPA). https://www.argentina.gob.ar/salud/alimentacion-saludable/grafico
- Ministerio de Salud de la Nación – Segunda Encuesta Nacional de Nutrición y Salud (ENNyS 2), analysed in Journal of Behavior and Feeding. https://www.aacademica.org/matias.salvador.ballesteros/63
- UNICEF Argentina – Situación alimentaria de niños, niñas y adolescentes en Argentina. https://www.unicef.org/argentina/informes/situacion-alimentaria-de-ninios-ninias-y-adolescentes
- Asociación Argentina de Dietistas y Nutricionistas Dietistas, cited in IntraMed. https://www.intramed.net/content/menos-del-10-de-los-chicos-en-edad-escolar-desayuna-bien
- Archivos Latinoamericanos de Nutrición – Adolescencia y riesgo nutricional. https://www.alanrevista.org/download/article/5469
- Student Project Guide – 5° Year Project 2026, Escuela Modelo de San Juan.
