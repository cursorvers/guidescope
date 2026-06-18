# GuideScope

Prompt builder for exploring Japanese domestic medical AI guidelines. Generates structured prompts and search queries targeting official government sources (MHLW, PMDA, etc.) with presets for medical devices, clinical operations, research ethics, and generative AI.

## Tech stack

- React 19, TypeScript 5.6, Vite 7.1
- Tailwind CSS 4.1, shadcn/ui (53 components), Radix UI, Framer Motion
- Zod for schema validation, Wouter for routing, React Hook Form
- Vitest for testing, Prettier for formatting
- pnpm 10.27 monorepo (workspace: packages/*)
- tsup for package builds, GitHub Pages for deployment

## Project structure

- `client/` -- Web UI (Vite root)
  - `src/components/` -- app components (OutputPanel, SettingsPanel, Header, etc.)
  - `src/components/ui/` -- shadcn/ui primitives
  - `src/contexts/` -- ThemeContext, SettingsContext, MinimalModeContext
  - `src/hooks/` -- useConfig, useSources, useAuditLog, useMobile, etc.
  - `src/lib/` -- template engine, presets, schemas, analytics, pdf, llm, privacy
- `packages/core/` -- standalone npm package (`@cursorvers/guidescope`): generate(), types, presets, template
- `packages/mcp/` -- MCP server for Claude Desktop / Cursor integration
- `scripts/publish.sh` -- package publish script
- `dist/` -- build output (includes sources.json / sources.schema.json)
- `.github/workflows/` -- CI/CD

## Commands

```
pnpm install            # install dependencies
pnpm dev                # dev server (port 3000)
pnpm dev:minimal        # dev with minimal mode (.env.minimal)
pnpm build              # build web UI to dist/
pnpm build:packages     # build core + mcp packages
pnpm build:full         # production build (.env.production)
pnpm preview            # preview built site
pnpm test               # run vitest
pnpm test:coverage      # vitest with coverage
pnpm check              # tsc --noEmit
pnpm format             # prettier --write
```

## Environment variables

- `VITE_MINIMAL_MODE` -- enables minimal UI mode
- `BASE_URL` -- set automatically by Vite; `/guidescope/` on GitHub Actions

## Constraints

- Client-side only; no backend server. All data stays in localStorage/sessionStorage.
- Path alias `@` resolves to `client/src`.
- GitHub Pages base path adjusts via `GITHUB_ACTIONS` env detection in vite.config.ts.
- Core generator is a pure TypeScript library with no DOM dependencies.
