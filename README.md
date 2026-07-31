
  # Live Score Dashboard

  This is a code bundle for Live Score Dashboard. The original project is available at https://www.figma.com/design/wSdtm6pwBJr96jOlYRtSz3/Live-Score-Dashboard.

  ## Requirements

  - Node.js `>= 22.12` (Vite 8 requirement; also works on Node 20 `>= 20.19`)
  - npm 10+

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server (http://localhost:5173).

  ## Scripts

  | Command | Description |
  | --- | --- |
  | `npm run dev` | Start the Vite dev server |
  | `npm run build` | Production build (Rolldown) into `dist/`, incl. sitemap + prerendered SEO pages + PWA service worker |
  | `npm run typecheck` | Type-check the app with TypeScript (`tsc --noEmit`) |

  ## Tech stack (2026 refresh)

  - **React 19** + **React DOM 19** (now declared as direct dependencies)
  - **Vite 8** (Rolldown-based bundler) with `@vitejs/plugin-react` 6
  - **Tailwind CSS 4** via `@tailwindcss/vite`
  - **TypeScript 7** with a project `tsconfig.json` and `npm run typecheck`
  - **React Router 8** (data router via `createBrowserRouter`)
  - **TanStack Query 5**, **Supabase JS 2**, **Zod 4**
  - **Radix UI** primitives + shadcn-style components
  - **recharts 3**, **@daypicker/react 10** (formerly `react-day-picker`), **lucide-react 1.x**
  - **vite-plugin-pwa** (Workbox service worker)

  Brand icons removed from lucide v1 (`Facebook`, `Twitter`, `Instagram`,
  `Youtube`, `Chrome`) are provided locally in
  `src/app/components/sports/BrandIcons.tsx` as inline SVGs.

  ## Backend server

  A small Express 5 API proxy lives in `server/`:

  ```bash
  cd server
  npm i
  npm run dev    # tsx watch
  npm run build  # tsc → dist/
  npm start      # node dist/index.js
  ```

  See `.env.example` for the required environment variables.
