# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Next.js app (App Router) with Convex functions in `frontend/convex/`, UI components in `frontend/components/`, pages under `frontend/app/`, and global styles in `frontend/app/globals.css`.
- `backend/`: TypeScript Express server. Source in `backend/src/` (routes, services, models), tests in `backend/tests/`, public assets in `backend/src/public/`, and views in `backend/src/views/`.
- `documentation/`: Design and deployment notes. `what-we-are-building/`: product specs and user flows.

## Build, Test, and Development Commands
- Frontend dev: `cd frontend && npm i && npm run dev` — starts Next dev server.
- Frontend build/start: `npm run build && npm run start` — production build and serve.
- Backend dev (hot reload): `cd backend && npm i && npm run dev:hot` — nodemon + ts-node.
- Backend build: `npm run build` — lints, type-checks, compiles to `backend/dist/` and copies assets.
- Backend start: `NODE_ENV=production npm start` — runs compiled server from `dist`.
- Linting: `npm run lint` in `frontend/` or `backend/`. Type-check backend with `npm run type-check`.
- Tests (backend): `cd backend && npm test` — runs Vitest.

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, single quotes, semicolons; 80-char soft max in backend (see `backend/eslint.config.ts`).
- File names: lowerCamelCase for utilities (e.g., `misc.ts`), PascalCase for models/services (e.g., `UserService.ts`).
- Prefer explicit return types for exported functions; avoid unused vars; limit console logs.
- Frontend follows Next.js + TypeScript defaults; keep components in `components/` and colocate small hooks in `hooks/`.

## Testing Guidelines
- Framework: Vitest (backend). Tests live under `backend/tests/` and use `*.test.ts` naming (e.g., `users.test.ts`).
- Setup files: configured via `backend/vitest.config.mts`.
- Aim to cover routes, services, and validators; mock repos via existing mock files in `backend/src/repos/` when needed.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise scope (e.g., "feat(backend): add user routes"). Group related changes; keep diffs focused.
- PRs: include summary, rationale, and screenshots for UI changes; link issues; note migration/config steps. Ensure CI passes lint, build, and tests locally.

## Security & Configuration Tips
- Environment: copy `frontend/.env.example` and set required keys; backend uses `backend/config/.env.*`. Do not commit secrets.
- Auth/Webhooks: Clerk/Convex config files live in `frontend/convex/` and `frontend/app/api/`. Validate signatures and never log sensitive data.
