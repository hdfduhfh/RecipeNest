# Live Server Edition Checks

- 45/45 regression checks passed, covering data, filters, serving calculations, Local Storage, and six languages.
- 54/54 data and recipe-search checks passed when the check code ran in a JavaScript environment using local files.
- Chat controller: sending a question, returning ingredient quantities for six people, and clearing the conversation worked without a separate HTTP service.
- JavaScript syntax checks passed.
- The contents of `assets/`, `css/`, and `data/` were verified against the original source and remained unchanged.
- Visual browser verification remains incomplete because the automated browser could not start in the verification environment.

To check the website in VS Code, open `index.html` with Live Server. Visit the pages, search for recipes, calculate servings, save favourites, add planned meals, switch languages, and use the recipe chat guide. Open `tests/browser.html` through Live Server to run 54 checks in the browser.

Older test records in `docs/` are historical references.
