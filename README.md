
<p align="center">
	<img src="./img/favicon.png" alt="ChronoBlock Logo" width="64" height="64" />
</p>

# ChronoBlock: Transform Your Day Into Purposeful Time Blocks

<p align="center">
	<a href="https://www.paypal.com/ncp/payment/KCPSV3QU7342C" target="_blank" rel="noopener noreferrer">
		<img src="https://perlmancamp.org/wp-content/uploads/2023/12/donate-with-paypal-payment-button-free-png-21635275830wcls7sprzu-1.png" alt="Donate with PayPal" style="height:48px;">
	</a>
</p>

<p align="center"><b>If you find this project useful, consider supporting development with a small donation via PayPal. Thank you!</b></p>

[![Netlify Status](https://api.netlify.com/api/v1/badges/029addff-0c26-43a4-a524-c60fbbdc4a4f/deploy-status)](https://app.netlify.com/projects/timemana/deploys)

ChronoBlock is a simple, privacy-first web app to help you structure your day, build empowering routines, and optimize your productivity. No login, no cloud, no tracking—just a clean, modern tool for time blocking and task management. 100% free and open source.


---

## ✨ Key Features

- **No Login Required:** Start instantly—no sign-up, no personal data collection.
- **Local Data Storage:** All routines, tasks, and notes are saved on your device. Your privacy is guaranteed.
- **Routine Builder:** Set your wake/sleep times, divide your day into customizable blocks (e.g., morning, work, evening).
- **Task Management:** Add tasks to each block, with notes in Markdown. Complete, delete, or reorganize as you go.
- **Visual Customization:** Color-code blocks, switch to dark mode, and personalize your experience.
- **Export/Import:** Backup or transfer your routines and tasks easily.
- **100% Free & Open Source:** No fees, no subscriptions. The code is open for anyone to use or contribute to.


---

## 🚀 How It Works

1. **Set Your Day's Boundaries:** Enter your wake-up and sleep times (e.g., 7:00 AM to 11:00 PM).
2. **Organize Your Day:** Divide your day into blocks (e.g., Morning Routine, Work, Evening).
3. **Add Tasks & Notes:** For each block, add tasks and notes (Markdown supported). Adjust as your routine evolves.
4. **Optimize & Reflect:** Edit blocks and tasks to improve your schedule. Move things around as needed.
5. **Customize & Export:** Use dark mode, color blocks, and export/import your data as needed.


---

## 🛡️ Why Choose ChronoBlock?

- **Simplicity:** No clutter, no distractions. Focus on your routine and tasks.
- **Privacy:** Your data never leaves your device. No cloud, no tracking.
- **Empowerment:** Build routines that energize and motivate you. Adapt and optimize as you learn what works best.
- **Accessibility:** Free for everyone, open source for transparency and collaboration.


---

## 🏁 Quick Start

Serve the project from the repository root and open it in your browser. Example using Python:

```bash
cd /path/to/time_management_webapp
python3 -m http.server 8000
# then open http://localhost:8000 or http://localhost:8000/app/index.html
```

Or with Node.js:

```bash
npx http-server -c-1 . -p 8000
# then open http://localhost:8000 or http://localhost:8000/app/index.html
```

Open `app/index.html` for the interactive planner UI. The root `index.html` is a simple landing page for the project.


---

## 🧪 Running Tests (in-browser)

Open the app in your browser and run the test script from the Developer Console:

1. Open the app (e.g. `http://localhost:8000/app/index.html`).
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


---

## 📁 File Layout

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


---

## 🔒 Data & Storage

- All user data is stored client-side in `localStorage`.
- To reset the app state: open DevTools Console and run:

```javascript
localStorage.clear();
location.reload();
```


---

## 🤝 Contributing & Development Notes

- This is a small, frontend-only project. No backend required.
- If you add build tooling, include an updated `README` section describing build steps and required versions.


---

## 🛠️ Troubleshooting

- If the UI looks unstyled, ensure you are running a local server (not `file://`).
- If tests behave strangely, refresh the page and re-run `localStorage.clear()` to reset state.

---

## 📄 License

This project is provided under the terms of the `LICENSE` file in the repository.
