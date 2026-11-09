# Chatbot integration checks — 2026-11-01

## Automated checks

`node --test tests/*.test.js`: **59 passed, 0 failed** on Node.js 24.19.0.

Includes the original recipe, storage and six-language tests, plus chatbot checks for:

- Local search in six languages, actual recipe steps and ingredient quantities (6 servings of lemon pasta = 540 g spaghetti), contextual follow-up, missing results.
- Complete chatbot interface translations and matching placeholders.
- Trusted website context, supported serving tables and validated recipe IDs.
- Server-only `.env` loading, environment overrides, fixed Ollama Cloud endpoint and Bearer authentication.
- Ollama request/response shapes, hidden reasoning excluded, empty/error/truncated responses rejected, no automatic paid retry.
- HTTP round trip, explicit unconfigured/error responses, invalid role/body/language rejection, size and rate limits.
- Refusal to serve `.env`, server code, tests and tools; cross-origin requests rejected.

API responses are mocked. No real key or paid inference was used. Actual account authentication, model access, latency and response quality require the user's Ollama Cloud key and a live question.

## Browser checks

Checked the actual AngularJS interface in Chromium through an isolated preview port:

- Floating launcher, opening panel, suggestions, text input and send.
- Vietnamese recipe search and ingredient answer, original recipe links, automatic panel closure when opening a recipe.
- Source card explicitly identifies base servings, distinct from requested servings in the answer.
- Desktop 1280 × 860 and mobile 360 × 800. Mobile document width 345 px; panel left 12 px, right 332.8 px, inside the usable page. No broken recipe card images observed.
- Clear conversation, keyboard Escape, input focus and launcher focus restored.
- Gateway UI fixture: loading indicator, duplicate-send prevention, answer rendering, explicit provider error, user-selected local fallback, cancellation while pending, no delayed message after clear.
- No JavaScript console errors observed in the normal local preview. The mock failure intentionally returned HTTP 502.

Screenshots `chat-desktop.png` and `chat-mobile.png` show the real local guide before an Ollama key is configured. They do not represent a live AI response.

Original recipe data, favourites storage keys and meal-plan storage keys were preserved.
