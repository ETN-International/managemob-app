# Managemob

Managemob is an open-source web platform for managing international mobility programmes (Erasmus+, ESC and similar). It tracks incoming and outgoing participants, sending organisations, host companies, accommodation, insurance, transfers, language courses and finances, and generates Word documents (Europass Mobility, Learning Agreements, contracts, letters…) automatically from templates with placeholders.

The platform is designed to be **forked and customised**: each organisation deploys its own instance with its own database, adapts the document templates to its needs and, if desired, modifies the application itself.

## Tech stack

- **Frontend:** React 18 + TypeScript, built with Vite
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) — no custom server required
- **Documents:** docxtemplater (Word generation), Recharts (dashboard charts)
- **Languages:** English, Italiano, Français, Español, Deutsch, Svenska, Português

## Getting started

### 1. Fork the repository

Use GitHub's **Fork** (or **Use this template**) button to create your own copy.

### 2. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Then run each file in [`supabase/migrations/`](supabase/migrations/) (this also creates the `document-templates` storage bucket used for Word templates).

### 3. Configure the environment

Copy `.env.example` to `.env` and fill in the values from your Supabase project (**Settings → API**):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm install
npm run dev
```

### 5. Deploy

Build with `npm run build` — the output in `dist/` is a static site that can be hosted anywhere (Netlify, Vercel, Coolify, your own server). Set the two `VITE_*` environment variables in your hosting platform.

## ⚠️ Security checklist before going live

- **Disable public sign-up.** Each Managemob instance is meant for a single organisation: any authenticated user can read and edit all data. In the Supabase dashboard go to **Authentication → Sign In / Up → User Signups** and disable *"Allow new users to sign up"*. Create accounts for your staff manually from **Authentication → Users**.
- **Never commit real data or secrets.** Participant data includes passports, birth dates and bank details. Keep CSV exports and generated SQL out of git (the `.gitignore` already excludes `datiAirtable/` and `import_data.sql`). Never hard-code the Supabase `service_role` key anywhere — it bypasses all security policies.
- **If a key has ever been committed,** rotate it in **Settings → API → Reset keys** (clearing files is not enough: git history keeps old versions).

## Importing existing data

The `scripts/` folder contains utilities to import CSV exports (e.g. from Airtable) into Supabase. Place your CSV files in a local `datiAirtable/` folder (git-ignored) and run:

```bash
# Import using your own login (respects security policies)
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your-anon-key \
SUPABASE_EMAIL=you@example.org SUPABASE_PASSWORD=yourpassword \
node scripts/import_csv.mjs
```

Alternatively, `scripts/generate_sql.mjs` converts the CSVs into an `import_data.sql` file you can paste into the Supabase SQL Editor.

## Customisation

- **Document templates:** see [`TEMPLATE_GUIDE.md`](TEMPLATE_GUIDE.md) and the in-app *Template Guide* page for the full list of `{placeholder}` tags.
- **User manual:** [`USER_GUIDE.md`](USER_GUIDE.md) and [`Managemob_Operational_Guide.md`](Managemob_Operational_Guide.md) (multilingual HTML version included).
- **Code:** pages live in `src/pages/`, translations in `src/locales/`, the database schema in `supabase/schema.sql`. The codebase deliberately favours simple, self-contained pages so that partners can adapt individual sections without deep React experience.

## License

Licensed under the [European Union Public Licence v. 1.2](LICENSE) (EUPL-1.2).

## Acknowledgements

Developed by ETN International. Co-funded by the European Union. Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or the granting authority.
