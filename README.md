# RecipeNest — AngularJS Website Development

A recipe discovery and meal planning website developed according to the RecipeNest **Problem Statement / Functional Requirement Specification**.

## Run with Live Server in VS Code

1. Open the entire `RecipeNest` folder using **File → Open Folder** in VS Code.
2. Install the **Live Server** extension by Ritwick Dey if it is not already installed.
3. Right-click `index.html` and select **Open with Live Server**, or click **Go Live**.
4. Use the address opened in your browser, usually `http://127.0.0.1:5500`.
5. Click the Live Server port indicator in the VS Code status bar to stop the server when finished.

No Node.js installation, terminal commands, or service keys are required. Do not open the website through `file://`, because AngularJS loads JSON data and templates over HTTP.

The chat panel searches the supplied data for recipes, ingredients, cooking steps, serving quantities, and planner instructions. This edition does not connect to a cloud AI service. The interface, recipe data, and other website features are retained.

## Features

- Home: search, featured recipes, collections, and a planner introduction.
- Catalogue: 24 recipes; case-insensitive search by name, keyword, or ingredient; four combined filters; A–Z, Z–A, and cooking-time sorting; result counts; clear-all controls; and an empty-results state.
- Recipe details: stable IDs, ingredients, cooking steps, preparation time, base servings, notes, tags, sample allergens, contributors, and related recipes.
- Serving calculator: accepts whole numbers from 1 to 20; new quantity = original quantity × requested servings ÷ base servings; rounds to two decimal places and preserves units. Salt and pepper marked “to taste” are not scaled.
- Favourites: add or remove recipes, prevent duplicate IDs, and save and restore selections using Local Storage.
- Planner: seven days with three meals per day; one recipe and serving count per slot; add, replace, and remove meals; count planned meals; and restore valid saved data.
- Collections: quick meals, breakfast, vegetarian dishes, and Vietnamese dishes.
- Contributors: three fictional profiles linked to their recipes by ID.
- Gallery: local images, captions and credits, previews, previous/next controls, arrow-key navigation, Escape to close, focus containment, and focus restoration when the dialog closes.
- About: project scope, workflow, calculation assumptions, and credits.
- Contact: AngularJS required-field and email validation, field-specific errors, reset, and a demonstration confirmation. The form does not send email or store contact details.
- Responsive navigation and layout: mobile menu, active links, a skip link, and visible keyboard focus.

## Scope and Assumptions

- This is a **front-end** educational project without accounts, a database, or transactions. The chat guide searches data directly in the browser and does not require an application backend.
- The interface defaults to English and also supports Vietnamese, Japanese, Simplified Chinese, French, and Hindi. This README is in English; some supporting guides remain in Vietnamese.
- Recipes, dietary tags, and allergens are sample information and are not guaranteed to meet a particular dietary requirement. Contributor profiles are fictional.
- Unsplash images illustrate food or ingredient categories and may not depict the exact prepared dish. Some images are reused for similar dishes. See `assets/CREDITS.md`.
- Countable ingredients may produce fractional quantities, such as 1.5 eggs. The calculator displays mathematical results; cooks should make practical adjustments.
- Preparation time is an estimated total preparation/cooking time and does not increase with the serving count. Water added to adjust consistency is treated as a process aid when no fixed quantity is specified.
- Removing a favourite **does not remove** a planned meal. The planner references recipe IDs in the catalogue independently of the favourites list.
- The planner represents a sample Monday–Sunday week without specific calendar dates.
- If Local Storage fails, the application displays a warning and continues using memory. Data may be lost after a reload.

## Project Structure

```text
index.html                 Application shell, header/footer, and ng-view
css/styles.css             Main styling and responsive layout
js/logic.js                Pure validation, scaling, filtering, cleanup, and counting functions
js/app.js                  recipeNest module, routes, controllers, services, and directives
templates/                 AngularJS views and the reusable recipe card
data/recipes.json          24 recipes, 3 contributors, and 4 collections
data/build-samples.py      Optional script for regenerating sample data
data/download-assets.py    Optional script for downloading images again; requires Internet
assets/images/             Local JPEG images and SVG favicon
assets/vendor/             Bundled framework and CSS assets, with licence notices
assets/CREDITS.md           Image and library credits
js/chat*.js                Chat interface, recipe search, and six-language translations
CHATBOT-SETUP.md            Recipe guide usage instructions
.vscode/                   Live Server settings and extension recommendation
tests/browser.html         Browser checks; open with Live Server
tests/browser.js           Browser check implementation
docs/PROJECT-REPORT.html   Report, diagrams, test cases, and screenshots
docs/TEST-RESULTS.md       Historical test results and limitations
docs/LIVE-SERVER-CHECKS.md Checks and limitations for the Live Server edition
docs/DEMO-GUIDE.md         Presentation video recording script
ReadMe.doc                Word-readable RTF startup guide
```

The Python scripts are optional authoring tools. They are not required to run the website with Live Server.

## AngularJS Architecture

The `recipeNest` module depends on `ngRoute`. `Catalogue` loads JSON data and preserves filters when users open a recipe and return to the catalogue. `SavedData` shares Local Storage handling between favourites and the planner. `ShellController` manages navigation, while separate controllers handle the catalogue, recipe details, planner, contact form, gallery, collections, profiles, and favourites. `recipeCard` provides reusable recipe cards, and `modalKeys` manages keyboard interaction and focus inside dialogs.

The application uses `ng-model`, `ng-repeat`, `ng-if`, `ng-class`, `ng-submit`, AngularJS form validation, data binding, and hash routing. User-entered content is displayed as text through AngularJS interpolation rather than `ng-bind-html`.

## Checks and Data Reset

Open `tests/browser.html` with Live Server to run checks directly in the browser. Results recorded in older documentation are historical and should not be treated as test results for this edition. See `docs/LIVE-SERVER-CHECKS.md` for current verification details and limitations.

To reset saved data, open **DevTools → Application/Storage → Local Storage**, select the website's local address, and delete these keys:

```text
recipenest.favourites.v1
recipenest.plan.v1
recipenest.language.v1
```

Alternatively, clear the site data for that address in the browser settings. Reload the page afterward. Each address and port has its own browser storage. The contact form does not store data, and the website has no passwords.

## Versions and Credits

- AngularJS **1.8.2** and angular-route **1.8.2** are bundled with the project. Source: [AngularJS 1.8.2](https://code.angularjs.org/1.8.2/). The MIT licence notice is included in `assets/vendor/ANGULAR-LICENSE.txt`.
- Stylesheets, fonts, and application assets are served locally; the running website does not require remote APIs.
- See `assets/CREDITS.md` and `docs/TEST-RESULTS.md` for asset sources, historical browser checks, and verification that remains to be completed.

## Language Switching

- The language selector is a **round flag button** on the right side of the header, following the Sweet Bakery reference design. Clicking it opens a panel with flags, language names, and codes. On mobile, the button shares the logo/menu row.
- Available languages: **English** (default), **Tiếng Việt**, **日本語**, **中文** (Simplified Chinese), **Français**, and **हिन्दी** (Hindi).
- The first visit uses English rather than automatically selecting the operating system language. Later selections are saved under `recipenest.language.v1`.
- Switching languages updates the current page while preserving filters, form entries, serving counts, favourites, and planned meals.
- Translations cover the interface, all 24 recipes, ingredients, cooking steps, notes, collections, profiles, messages, and image descriptions. Proper names and technology labels remain unchanged.
- Search supports recipe and ingredient names in the selected language as well as English keywords. Vietnamese search also accepts text without diacritics. Recipe IDs, filter values, and planner slot keys retain their canonical English values to preserve saved-data compatibility.
- Hindi uses language code `hi` and HTML language tag `hi-IN`.
- All translations are stored locally and require neither a translation API nor an Internet connection.
- See `docs/LANGUAGE-SUPPORT.md` for translation structure, editing instructions, and checks.
