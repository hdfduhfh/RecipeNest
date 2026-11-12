# Six-Language Support in RecipeNest

Historical test results in this document predate the Live Server edition. For current checks, see `LIVE-SERVER-CHECKS.md` and open `tests/browser.html` through Live Server.

## Usage

Open the website and use the language selector in the header:

| Language | Stored code | HTML lang attribute |
|---|---|---|
| English | en | en |
| Vietnamese | vi | vi |
| Japanese | ja | ja |
| Simplified Chinese | zh | zh-CN |
| French | fr | fr |
| Hindi | hi | hi-IN |

English appears first and is the default when there is no saved selection, the stored value is invalid, or storage cannot be read. The application does not infer a language from the browser or operating system. A selection is saved separately for each website address and port.

Switching languages does not reload the route. Filters, form entries, validation state, calculator servings, favourites, and planned meals remain intact. The tab title, image descriptions, screen-reader labels, and messages are also updated. Brand names, personal names, and library names remain unchanged. Reports, image credits, and technical documentation are separate from the translated interface.

## Translation Coverage

- Header, footer, mobile menu, buttons, labels, placeholders, empty states, validation errors, and messages.
- Names, descriptions, all four cooking steps, notes, dietary labels, allergens, and image descriptions for all 24 recipes.
- Ingredient names and unit labels; original numeric quantities and canonical units remain unchanged.
- Collections, biographies, and fictional contributor profiles.
- Days, meals, the planner editor, form confirmations, and calculator messages.

Search accepts recipe and ingredient names in the selected language and English keywords. Vietnamese search also supports text without diacritics, including the Vietnamese stroked-d character. Catalogue sorting uses `Intl.Collator` for the selected language. Combined filters retain canonical values such as Italian, Breakfast, and Vegan while their displayed labels are translated.

## Source Structure

| File | Purpose |
|---|---|
| js/i18n-core.js | Pure functions for supported languages, normalization, translation, parameters, restoring selections, multilingual search, and sorting |
| js/i18n-angular.js | I18n service, t/tList filters, lang/title updates, and the languageChanged event |
| js/translations.js | Local dictionary bundle for all six languages; no external translation service |
| css/i18n.css | Space for longer labels, mobile menus/selectors, and Vietnamese/Japanese/Chinese font support |
| tools/ui-source.json | Original English interface strings |
| tools/ui-translations.txt | Interface translations; the first column is an index in ui-source.json |
| tools/common-translations.txt | Terms, labels, parameterized messages, ingredients, and image descriptions |
| tools/recipe-translations.txt | Recipe text by ID and field: name, description, notes, and cooking steps 0–3 |
| tools/other-content.txt | Contributor profiles and collections by ID |
| tools/hindi-translations.txt | Hindi translations using ui/common/recipe/other/image references |
| tools/build-translations.py | Regenerates the bundle and checks translation coverage for recipe data |
| tests/browser.html | Browser checks for the Live Server edition |

Templates use the `t` filter and stable `text.<hash>` keys to avoid placing long paragraphs inside HTML expressions. The bundle maps these keys to English text. Dynamic values such as recipe names use expressions like `recipe.name | t`. The filter is `$stateful` so the interface updates immediately when the language changes.

## Editing Translations

Open the `.txt` files in `tools/`. Each line in the original translation files has five columns separated by `¦`: key, Vietnamese, Japanese, Chinese, and French. Preserve parameters such as `{name}`, `{recipe}`, `{slot}`, and `{count}`. Do not include `¦` inside translated text.

After editing, run the optional translation builder from the RecipeNest folder:

```sh
python tools/build-translations.py
```

Then open `tests/browser.html` with Live Server.

The builder uses only Python's standard library and requires no additional packages. Python is an optional authoring tool and is not required to run the website. Editing existing translations does not require template changes or changes to `data/recipes.json`.

## Storage and Compatibility

The selected language is stored under `recipenest.language.v1`, independently of `recipenest.favourites.v1` and `recipenest.plan.v1`. The translation feature does not change favourite or planner formats, modify recipe IDs, or migrate existing data. If the language selection cannot be saved, it still works in the current tab and a warning is shown.

To reset only the language, select English or delete the language key and reload. Favourites and planned meals do not need to be deleted. Display values are rendered as text through AngularJS rather than `ng-bind-html`, and form content is not sent to a backend.

## Historical Verification

- The earlier automated suite passed 45/45 checks, including the original checks and additional Hindi coverage. These results belong to the previous test suite, not the current browser-check page.
- The in-app browser was checked across 165 views: five languages × 11 routes × three widths of 360, 768, and 1280 px. The final run recorded no horizontal overflow, unresolved translation keys, or console errors/warnings. See `language-viewport-checks.json`.
- Language selection survived reload. Searches using an unaccented Vietnamese tofu keyword and the Chinese tofu keyword returned relevant dishes.
- Combining the keyword basil with Italian, Breakfast, a 15-minute limit, and Vegan returned the same single recipe across all six languages. Filter values remained unchanged when labels changed.
- Name, email, and message entries were retained when switching languages before and after form submission. The demonstration confirmation was translated. No email was sent.
- The calculator retained 540 g of spaghetti for six people after switching to French. Adding the recipe to the planner retained six servings; switching to Vietnamese and reloading preserved the meal. Favourites continued to reference the same ID.
- The Japanese mobile menu opened and closed after selecting Recipes; aria-expanded returned to false.
- Historical screenshots: `languages-desktop.png` and `languages-mobile.png`. Their saved data was test data from a separate preview port and was not included as project defaults.

These checks used the in-app browser and simulated viewports. They do not establish full coverage on a second independent desktop browser or a physical phone. The limitations in `TEST-RESULTS.md` still apply.

## Hindi Addition

Hindi is the sixth language, using code `hi` and locale `hi-IN`. English remains first and is the default. The existing translations for the first five languages were compared and preserved.

`tools/hindi-translations.txt` contains two columns separated by `¦`: a source reference and its Hindi translation. Prefixes identify the source: `ui:` refers to an index in ui-source.json; `common:` refers to an English string; `recipe:` refers to a recipe ID and field; `other:` refers to a contributor or collection; and `image:` refers to a recipe ID. After editing, run `python tools/build-translations.py`, then open `tests/browser.html` through Live Server. The Vietnamese/Japanese/Chinese/French files retain their original five-column structure.

Historical Hindi checks covered 11 routes at widths of 360, 768, and 1280 px: 33 views with no horizontal overflow, unresolved translation keys, or console errors. See `hindi-viewport-checks.json`. Searching for basil in Hindi returned three relevant dishes; combining Italian, Breakfast, a 15-minute limit, and Vegan returned one bruschetta recipe. Selecting Hindi and reloading preserved the language and HTML lang `hi-IN`. Devanagari font support was applied locally without downloading fonts. See `hindi-desktop.png`.

## Flag Selector Design

The earlier select control was replaced with a round SVG flag button based on the header in the supplied Sweet Bakery reference project. The white panel is 260 px wide with 18 px rounded corners and a shadow. Each row contains a flag, native language name, and short code. The selected row uses a cream background and burgundy text. Five reference SVGs were reused and an Indian flag was added for Hindi. English remains first and is the default.

- `templates/language-picker.html`: summary/details control and six language buttons.
- `js/language-picker.js`: directive connected to the existing I18n service. It closes after selection, an outside click, Escape, or a route change; supports arrow keys, Home, and End; and restores focus to the flag button after selection.
- `css/language-picker.css`: reference styling, panel size limits, and mobile header layout.
- `assets/images/flags/`: six local SVG flags without emoji or external services.

Historical UI checks covered 24 combinations: six languages × widths of 320, 360, 768, and 1280 px. No page or panel overflow or broken flags were recorded, and each panel had exactly one selected row. Checks included keyboard navigation, Escape, outside clicks, language persistence after reload, retained form entries, six-serving calculator output of 540 g pasta, and favourites. The mobile menu continued to open, close, and navigate normally. See `flag-picker-checks.json`, `flag-picker-desktop.png`, and `flag-picker-mobile.png`. The earlier automated suite remained at 45/45 passing checks.

Screenshot data came from a separate preview port; browser test data was not embedded in the source code. Localized screenshots and recorded interface text remain in their original languages as historical evidence.
