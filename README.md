# Managemob

**Managemob** is an open-source web application for managing learning-mobility projects (Erasmus+ and similar EU programmes): incoming and outgoing participants, groups, host companies, accommodation, travel, transfers, insurance, language courses and per-participant finances — plus automatic generation of filled Word documents (Europass Mobility, Learning Agreements, certificates, contracts…) from your own templates.

It was developed within an EU-funded project and is designed to be **forked and customised**: every mobility organisation can adapt the data model, the languages and the document templates to its own needs.

## Features

- **Participants** — incoming/outgoing, individuals and groups, full personal/mobility/financial record
- **Registry pages** — sending organisations, host companies, accommodation, mobility service providers, insurance, transfer and language-course providers
- **Travel details & calendar** — arrivals/departures at a glance
- **Document generation** — upload `.docx` templates with `{tag}` placeholders, generate filled documents for one participant or a whole group as a ZIP ([template guide](TEMPLATE_GUIDE.md))
- **Dashboard** — counts and charts of the ongoing mobilities
- **7 interface languages** — IT, EN, FR, ES, DE, SV, PT
- **Built-in user guides** — multilingual operational manual, template guide and self-hosting guide, downloadable as PDF

## Tech stack

React 18 + TypeScript + Vite single-page app, [Supabase](https://supabase.com) for authentication, PostgreSQL database and template file storage, [docxtemplater](https://docxtemplater.com) for document generation. No custom backend server is needed.

## Quick start

Prerequisites: Node.js 18+, a free Supabase account.

1. **Clone and install**

   ```bash
   git clone https://github.com/<your-org>/managemob-app.git
   cd managemob-app
   npm install
   ```

2. **Create the database** — create a new project on [supabase.com](https://supabase.com), then in the *SQL Editor* run, in this order:
   1. `supabase/schema.sql` (tables + row-level security)
   2. `supabase_migration.sql` and `migration_new_fields.sql` (extra columns)
   3. every file in `supabase/migrations/` (oldest first)
   4. `import_data.sql` *(optional — loads the sample dataset)*

3. **Configure the app** — copy `.env.example` to `.env` and fill in the values from *Supabase → Settings → API*:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open the printed URL, register the first user from the login page, and you're in.

5. **Lock down sign-ups (important)** — once your team's accounts exist, disable self-registration: *Supabase Dashboard → Authentication → Sign In / Up → turn off "Allow new users to sign up"*. Otherwise anyone who finds your URL can create an account with full access to the data. Administrators can still add users manually under *Authentication → Users*.

## Deployment

`npm run build` produces a static site in `dist/` that can be hosted anywhere. A `public/_redirects` file is included for **Netlify**; a step-by-step **self-hosting guide (Coolify)** in 7 languages is available in the app under *Guide* and as PDFs in `public/guide-pdf/`.

## Sample data

The repository ships with a fictional sample dataset to explore the app:

- `datiAirtable/*.csv` — source data, same column layout as an Airtable export
- `import_data.sql` — ready-to-run SQL generated from those CSVs (`node scripts/generate_sql.mjs` regenerates it after editing the CSVs)

To import your own Airtable data, export your tables as CSV with the same column names and use `scripts/import_to_supabase.mjs`. Never commit real personal data or credentials.

## Security checklist for production

- [ ] Self-registration disabled after creating your team's accounts (see Quick start, step 5)
- [ ] Remove the `"Allow anon read"` policies that `supabase/schema.sql` creates: they let anyone holding the anon key — which is embedded in the public JS bundle by design — read all data without logging in. In the SQL Editor run `DROP POLICY "Allow anon read" ON <table>;` for each table (the app works entirely through authenticated sessions, so nothing breaks).
- [ ] `.env` is never committed; the service-role key is never used in the frontend or hardcoded in scripts
- [ ] Verify your GDPR obligations: the app stores personal data (passports, IBAN, dates of birth) — appoint a data controller, define retention periods and inform participants

## Documentation

| Document | Purpose |
|---|---|
| [USER_GUIDE.md](USER_GUIDE.md) | End-user manual |
| [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) | How to prepare `.docx` templates with `{tag}` placeholders (in Italian) |
| `Managemob_Operational_Guide_Multilingual.html` | Multilingual operational manual (also served in-app) |

## License

Released under the [MIT License](LICENSE). Developed with the support of the Erasmus+ programme of the European Union. The European Commission's support does not constitute an endorsement of the contents.
