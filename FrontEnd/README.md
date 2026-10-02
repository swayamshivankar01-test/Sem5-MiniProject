# Roz ka Khata (Daily Ledger)

A personal daily expense tracker. Plain HTML, CSS and JavaScript. No install or build step needed.

## Run it
Open `index.html` in a browser (needs internet once for the Google Fonts).

## Structure
```
roz-ka-khata/
├── index.html        Page structure: cover panel, navigation and the 5 pages
├── css/
│   ├── theme.css     Colors and light/dark theme
│   └── style.css     Layout and components
└── js/               (loaded in this order)
    ├── data.js       Categories, money/date helpers
    ├── i18n.js       English / Hindi / Marathi translations
    ├── auth.js       Register / login / logout (local stand-in, swap for the Java API)
    ├── state.js      Expense data per signed-in user + save/load (localStorage)
    ├── render.js     Draws totals, pie (donut) chart, bars, lists
    ├── export.js     Export to CSV, Excel (.xlsx) and PDF (print report)
    └── app.js        Form, buttons, language switch, start-up
```

## Pages
Home, Add, History, Categories, Compare (month-wise comparison).

## Connecting a backend later
Replace the four methods in `js/auth.js` (register, login, logout, current) and `loadExps()` / `save()` in `js/state.js` with API calls (Java + PostgreSQL). The local auth is for development only and is not secure.
Add a language by adding a column in `js/i18n.js` and an `<option>` in `index.html`.
