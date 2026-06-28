# Future Development

This folder holds features that have been built but are intentionally **excluded from the active / live site**. They are preserved here for future development and are NOT imported by the running application.

## WeHA AI (chat assistant)

An OpenRouter-powered chat assistant page. Removed from the live site on request.

### Files
- `frontend/pages/WehaAI.jsx` — the full chat page (React).
- `frontend/lib/api-weha-ai.js` — the two API helper functions used by the page.
- `backend/weha_ai_endpoints.py` — the FastAPI route handlers + config (GET `/api/weha-ai/models`, POST `/api/weha-ai/chat`).

### How to re-enable later
1. Move `frontend/pages/WehaAI.jsx` back to `frontend/src/pages/WehaAI.jsx`.
2. Re-add the two helpers from `frontend/lib/api-weha-ai.js` into `frontend/src/lib/api.js`.
3. In `frontend/src/App.js`: import the page and add `<Route path="/weha-ai" element={<WehaAI />} />`.
4. Re-add the nav links in `Header.jsx` and `Footer.jsx`: `{ to: "/weha-ai", label: "WeHA AI" }`.
5. In `backend/server.py`: paste the contents of `backend/weha_ai_endpoints.py` back (it registers routes on `api_router`). Add `httpx` import if missing.
6. Set `OPENROUTER_API_KEY` in `backend/.env` to go live (otherwise it runs in demo/mocked mode).
