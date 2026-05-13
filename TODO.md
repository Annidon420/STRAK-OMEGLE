# TODO

## 1) Fix env + env.example files
- [ ] Inspect repo for all required environment variables used by backend/frontend.
- [ ] Create/repair root `.env.example` (no secrets) with correct keys.
- [ ] Create/repair `server/.env.example` (no secrets) with correct keys.
- [ ] Ensure `.env` files are gitignored.

## 2) Prepare Git push
- [ ] Check current git status and update `.gitignore` if needed.
- [ ] Commit updated env/example/render config changes.
- [ ] Provide final `git push` commands.

## 3) Deploy on Render
- [ ] Verify `render.yaml` is correct for both frontend and backend services.
- [ ] Provide step-by-step Render setup (Create Web Services, environment variables, MongoDB add-on, etc.).
- [ ] Explain how to confirm services are live (logs, health checks, test endpoints).

