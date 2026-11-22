# EDVORA recovery notes

This project uses the supplied `App.jsx`, `main.jsx`, `index.html`, `package.json`, `netlify.toml`, and README as its starting point. Missing CSS and Supabase helper modules were added to make the source tree complete.

## Important
- The stylesheet is a reconstruction based on the supplied React component class names and README's pearl-white / silver / royal-blue glass visual direction. Exact pixel matching cannot be guaranteed because the original stylesheet/reference screenshots were not supplied.
- Supabase URL is prefilled from the supplied README. Add the project's **publishable/anon** key as `VITE_SUPABASE_ANON_KEY`; never use a service-role/secret key in frontend code.
- The existing Supabase database schema, RLS policies, admin function and private `notes-pdfs` bucket must be verified before expecting login, note uploads or PDF access to work.
- No database schema or security policies are created or changed by this project.
