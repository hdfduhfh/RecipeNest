# Bootstrap interface update

RecipeNest now includes Bootstrap 5.3.8 CSS locally in `assets/vendor/bootstrap.min.css`.
Source: https://getbootstrap.com/docs/5.3/getting-started/download/
Bootstrap CSS is MIT licensed (license notice retained in the file).

`css/bootstrap-theme.css` adapts Bootstrap cards, buttons, badges and form controls to RecipeNest's existing cream, garden-green and tomato-red palette. Existing AngularJS controllers, routes, data and persistence are retained.

`js/ui-effects.js` provides route entry transitions, a route progress indicator, button click feedback and reveal-on-scroll effects. Motion is disabled when the operating system requests reduced motion. Keyboard focus reveals any pending card immediately. AngularJS continues to control menu and dialog state.

No additional install or build step is required. Start as before with `npm start`, then open the local address displayed in the terminal. Refresh with Ctrl+F5 if the previous styles remain cached.

Verification: all 59 existing Node tests passed; browser checks covered home, catalogue searching, route changes, planner dialog, contact controls, and the navigation menu at 390 px. No horizontal page overflow at the tested desktop/mobile sizes; no browser errors were recorded.
