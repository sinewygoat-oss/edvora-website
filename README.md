# EDVORA — Learn Beyond Limits

Premium blue Liquid Glass learning website built with React, Vite, Framer Motion, Lucide and Supabase.

## Included
- Cinematic EDVORA loading screen
- Liquid Glass navigation, cards and panels
- Scroll reveal, floating 3D-style cards and subtle hero parallax
- Responsive homepage and Classes 1–12
- Notes Library with class, stream, language and keyword filters
- Student email/password sign-up and login through Supabase Auth
- Student dashboard and locally saved bookmarks
- Admin-only note upload, edit and delete UI (role checked against `profiles.role`)
- Private PDF storage with short-lived signed URLs

## Run locally
1. Install Node.js 20.19+ or 22.12+.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` (the project base URL, ending in `.supabase.co`, NOT `/rest/v1/`) and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project URL and publishable key. Never use a `service_role` key in frontend code.

For Netlify, add these exact environment variable names in the site build environment: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Then trigger a fresh deploy so Vite embeds them into the build. This project reads either the publishable variable or legacy `VITE_SUPABASE_ANON_KEY`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Run `npm run build` before deployment.

## Supabase setup expected by this React version
The app expects:
- `public.profiles`: `id` (same as `auth.users.id`), `full_name`, `email`, `role` (`admin` for the site owner; ordinary students should not have this role).
- `public.notes`: `id`, `title`, `description`, `class_level`, `stream`, `subject`, `chapter`, `language`, `is_paid`, `pdf_path`, `is_published`, `created_at`.
- A **private** Storage bucket named `notes-pdfs`.

The frontend checks `profiles.role` to show the admin workspace, but UI checks are not security. Configure Supabase Row Level Security policies so only admins can insert/update/delete notes and upload/delete PDFs, and students can only read published notes and obtain signed URLs for permitted PDFs. Do not rely on hidden buttons as access control. Verify the real table columns and policies in your Supabase project before launch; this package does not alter or migrate your database.

The `is_paid` flag is currently a label only. No payment gateway or paid-content enforcement is included. Add server-side authorization before selling access.

## Deploy to Netlify
Connect the GitHub repository and use the build settings in `netlify.toml` (`npm run build`, publish directory `dist`). Add the two Supabase environment variables in Netlify site settings before deploying. Do not commit `.env`.

## Notes
The homepage uses an externally hosted Unsplash student photo. Replace it with an image you have permission to use if desired. The project has not been connected to or deployed on your Netlify account from this package.
