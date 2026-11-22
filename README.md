# EDVORA — Complete Website Project

EDVORA is a responsive React + Vite education website using a pearl-white, silver-glass and royal-blue visual direction.

## Included
- Responsive landing page and navigation
- Classes 1–12 and Class 12 stream selection
- Notes library with filters and PDF viewing
- Student sign-up / sign-in through Supabase
- Student dashboard and local bookmarks
- Admin notes upload/edit/delete UI (requires the matching Supabase schema and admin function)

## Run locally
1. Install Node.js 18 or newer.
2. In this project folder run `npm install`.
3. Copy `.env.example` to `.env` and fill in your Supabase publishable/anon key.
4. Run `npm run dev` and open the local URL shown in the terminal.

## Netlify deployment
- Build command: `npm run build`
- Publish directory: `dist`
- Add these environment variables in Netlify → Site configuration → Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Then trigger a new deploy.

## Supabase requirements
The frontend expects a `profiles` table, a `notes` table with the columns used in `src/lib/data.js`, a private Storage bucket named `notes-pdfs`, and an RPC function named `is_edvora_admin`. Row Level Security and Storage policies must be configured securely in Supabase. This project does not create the database schema or policies automatically.

Use only the Supabase publishable/anon key in the browser. Never put a service-role key in frontend code or Netlify's public build variables.

## Project structure
```text
EDVORA/
├── index.html
├── package.json
├── netlify.toml
├── vite.config.js
├── .env.example
├── .gitignore
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    └── lib/
        ├── data.js
        └── supabase.js
```

## Design note
The CSS is a reconstruction of the supplied EDVORA pearl-white / silver / royal-blue glass direction. Exact pixel matching to an earlier live design cannot be guaranteed without its original screenshots or source assets.
