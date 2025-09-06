# Daily Time Planner Web App

[![Netlify Status](https://api.netlify.com/api/v1/badges/029addff-0c26-43a4-a524-c60fbbdc4a4f/deploy-status)](https://app.netlify.com/projects/timemana/deploys)

A simple, focused web app for planning your day by creating time blocks and managing tasks.

## What this repo contains

- The main public landing is `index.html` (root). The interactive app UI lives under `app/index.html`.
- Tests and manual test pages live in the `testing/` folder (`tests.js`, `dark.html`, etc.).

## Key features

- Day setup (wake/sleep times)
- Create and manage time blocks
- Add tasks with notes, complete/delete tasks
- Dark mode with persistent preference
- Time summary (allocated vs remaining)
- Local browser persistence via `localStorage`

## Quick start (local)

Serve the project from the repository root and open it in your browser. Example using Python:

```bash
cd /path/to/time_management_webapp
python3 -m http.server 8000
# then open http://localhost:8000 or http://localhost:8000/app/index.html
```

If you prefer Node.js (http-server):

```bash
npx http-server -c-1 . -p 8000
# then open http://localhost:8000 or http://localhost:8000/app/index.html
```

Open `app/index.html` for the interactive planner UI. The root `index.html` is a simple landing page for the project.

## Running tests (in-browser)

Open the app in your browser and run the test script from the Developer Console:

1. Open the app (for example `http://localhost:8000/app/index.html`).
2. Open DevTools (F12) and paste the contents of `testing/tests.js` into the Console.
3. Use the provided helper commands from `tests.js`:

```javascript
// Run full suite
runTests()

// Or run a focused set
testTasks()
testBlocks()
testSettings()
testState()

// Quick smoke test
quickTest()
```

The test suite includes unit and integration-style checks (happy-path and negative tests).

## File layout

```
.
├── index.html           # Project landing
├── app/
│   └── index.html      # Main interactive planner UI
├── testing/
│   ├── tests.js        # In-browser test helpers and assertions
│   └── *.html          # Test/demo pages
├── img/                # Images and favicon
├── README.md
└── LICENSE
```

## Data & storage

- All user data is stored client-side in `localStorage`.
- To reset the app state: open DevTools Console and run:

```javascript
localStorage.clear();
location.reload();
```

## Contributing & development notes

- This is a small, frontend-only project. No backend required.
- If you add build tooling, include an updated `README` section describing build steps and required versions.

## Troubleshooting

- If the UI looks unstyled, ensure Tailwind CSS is loaded or open the app via a local server rather than using the `file://` protocol.
- If tests behave strangely, refresh the page and re-run `localStorage.clear()` to reset state.

## License

This project is provided under the terms of the `LICENSE` file in the repository.
