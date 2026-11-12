# RecipeNest Test Results

Historical reference: these results predate the Live Server edition. Current checks are documented in `LIVE-SERVER-CHECKS.md`; open `tests/browser.html` through Live Server to run the browser checks. Historical counts below refer to earlier test suites, not the current browser-check page.

Historical test date: **31 October 2026**. The source was served over local HTTP. Startup instructions for the current edition are in `README.md`.

## Recorded Environment

- Windows 10/11; the user agent reported Windows NT 10.0.
- ChatGPT's in-app browser reported **Chrome/156.0.0.0**. This identifies the reported user agent rather than confirming a separately installed desktop Chrome version.
- Historical test runtime: Node.js **24.19.0**. It is not required to run the current Live Server edition.
- AngularJS **1.8.2** and angular-route **1.8.2**.
- Viewports: **360 × 900, 768 × 900, and 1280 × 900**; visual mobile inspection at **360 × 800**.

## Historical Automated Checks

The initial suite recorded **33 tests, 33 passed, and 0 failed**.

Twenty-nine checks covered the schema, ID links, local images, servings, rounding, units, non-scalable ingredients, keyword search, combined AND filters, sorting, dataset immutability, duplicate ID removal, planner cleanup, and template/script assets.

Four additional checks exercised the actual `SavedData` factory with dependencies supplied by a test harness: favourite persistence; planner replacement, removal, and persistence; malformed JSON; blocked storage; and in-memory fallback. These used mock storage and do not imply that permissions were changed in a real browser.

## Historical Interface Checks

| ID | Action or input | Expected result | Recorded result |
|---|---|---|---|
| UI01 | Open the initial catalogue | 24 recipes | Passed: 24 recipes, sorted A–Z |
| UI02 | Search basil + Italian + Breakfast + ≤15 minutes + Vegan | Only Tomato & basil bruschetta | Passed: one recipe |
| UI03 | Open the UI02 recipe, then select Back to recipes | Preserve all filters | Passed: one result and all filters retained |
| UI04 | Search for nothing-xyz-999 | No results and a clear-filters suggestion | Passed |
| UI05 | Select Clear all | Restore 24 recipes and remove filters | Passed |
| UI06 | Lemon pasta: 180 g at base 2 servings; request 1, 6, and 20 | 90 g, 540 g, and 1800 g | Passed; salt to taste was not scaled |
| UI07 | Request 0, 21, 1.5, or an empty serving value | Show an error and hide calculated quantities | Passed in all four cases |
| UI08 | Save Lemon pasta and reload its detail page | Remain Saved to favourites | Passed; refreshing the detail route worked |
| UI09 | Select Add to meal plan | Open the editor with the selected recipe | Passed: Monday Dinner |
| UI10 | Enter 1.5 servings in the planner and save | Block saving and show an error | Passed |
| UI11 | Save Monday Dinner for 3 people and Tuesday Lunch with rainbow bowl for 2 | Count two meals and preserve data after reload | Passed |
| UI12 | Remove pasta from Favourites | Empty favourites while retaining two planned meals | Passed |
| UI13 | Change Monday Dinner to 1 serving and remove Tuesday Lunch | Monday retains 1 serving; count becomes one | Passed |
| UI14 | Submit an empty contact form | Three field-specific errors | Passed |
| UI15 | Enter bad-email with other fields valid | Email error without success confirmation | Passed |
| UI16 | Submit Demo Cook, demo@example.com, and a sample message | Demonstration confirmation without sending or storing data | Passed |
| UI17 | Reset the contact form | Clear inputs, errors, and success state | Passed |
| UI18 | Open a gallery image, use Next, ArrowRight, and Escape | Change images, close the dialog, and restore focus | Passed; focus returned to the original image button |
| UI19 | At 360 px width, open the menu and select Recipes | Open the menu and close it after selection | Passed; aria-expanded returned to false |
| UI20 | Edit Monday Dinner at 360 px width | Editor fits; fields and controls remain usable | Passed through visual inspection |
| UI21 | Check 11 routes at widths of 360, 768, and 1280 px | No horizontal overflow or broken images | Passed across 33 views; see viewport-checks.json |
| UI22 | Set the calculator to 6 servings, then Add to meal plan | Planner editor retains 6 servings | Passed |
| UI23 | Open an unknown recipe ID, contributor ID, or route | Error page with a return link | Passed in all three cases |

No console errors or warnings were recorded in the final browser run.

### Viewport Measurements

The 11 measured routes were home, recipes, recipe/lemon-pasta, planner, favourites, collections, contributors, contributor/linh, gallery, about, and contact.

`document.documentElement.scrollWidth` measured 345, 753, and 1265 px for viewport widths of 360, 768, and 1280 px respectively. The difference was the vertical scrollbar. All measurements were within the viewport width. `brokenImages` was zero at observation time. Offscreen lazy-loaded images were also checked through resource existence and dataset checks; an instantaneous DOM measurement does not verify every image byte in every browser.

## Verification Still Required Before Formal Submission

- Check a **second independent desktop browser**, such as Microsoft Edge or Firefox, record its version, and repeat UI01–UI21. The in-app browser alone does not establish full coverage in two desktop browsers.
- Test a physical phone if available. The recorded viewports simulate dimensions rather than physical devices.
- Screen-reader testing and a comprehensive WCAG audit have not been completed. Labels, alternative text, visible focus, a skip link, and modal keyboard controls are present.
- The demonstration video **has not been recorded**. `DEMO-GUIDE.md` provides a recording script.

Do not mark checks that have not been run as Passed. The current edition includes browser checks; older results and viewport measurements remain historical references.

## Historical Language Support Update

The five-language update added 11 checks, bringing the suite to 44/44 passing checks. Interface results, limitations, and translation editing instructions are in [LANGUAGE-SUPPORT.md](LANGUAGE-SUPPORT.md).

### Hindi Addition

The suite was extended to Hindi and recorded 45/45 passing checks. Hindi interface checks covered 33 views: 11 routes × three sizes, with no horizontal overflow or console errors. See `LANGUAGE-SUPPORT.md` and `hindi-viewport-checks.json`.
