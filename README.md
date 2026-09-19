# LabConnect

A static browser prototype for managing laboratory clusters and reporting computer faults. Create an account, set up a head node and compute nodes, and use the dashboard and reporting pages. Workspace data and accounts stay in browser local storage; authentication and device readings are prototype features, not a connected backend.

## Run locally

From the project root:

```sh
python -m http.server 8765
```

Open http://localhost:8765. No package installation or build step is required. Use localhost for browser cryptography used by account creation.

## Project structure

```text
index.html                 Shared HTML shell and ordered script entry points
assets/
  css/main.css             Base layout, theme, and shared styles
  css/agent.css            Workspace and authentication styles
  images/                  Image assets
  icons/                   Local icon assets
  fonts/                   Local font assets
src/
  app.js                   Startup and global UI listeners
  router.js                Page navigation and titles
  config/                  Status definitions and storage keys
  state/                   Shared workspace and view state
  services/                Browser persistence, authentication, report creation
  utils/                   Formatting and HTML escaping
  components/              Navigation, status badges, computer details
  pages/                   One file per application view
archive/
  old.html                 Original prototype, preserved unchanged
docs/                     Architecture and conversion notes
tests/
  check-browser.cjs        Current workflow smoke check
  legacy/check-browser.cjs Historical demo check (not the current app)
```

Pages include dashboard, monitoring, laboratories, report submission, my reports, fault management, computers, users, analytics, authentication, and onboarding. These are JavaScript-rendered views inside the shared shell, not separate HTML documents. Existing navigation and visibility rules are preserved.

External Inter fonts and Font Awesome icons still load from their existing CDNs. The local asset folders are ready for replacements or additional assets.

## Verification

Requires Node.js 22+, the local HTTP server, and a **disposable** Chrome profile with remote debugging on port 9223. Run:

```sh
node tests/check-browser.cjs
```

Optional environment variables: `APP_URL` (default `http://127.0.0.1:8765/index.html`) and `DEBUG_URL` (default `http://127.0.0.1:9223`). The check creates a local test account and workspace, so do not attach it to a profile containing real workspace data. It checks signup, onboarding, all nine workspace views, searching, fault submission and resolution, session persistence, mobile navigation, and logout.

See [architecture and conversion notes](docs/architecture.md) for the migration boundaries.
