# Steward CRM

Lightweight donor relationship management for faith-based organizations.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `sql/01_schema.sql`
3. Then run `sql/02_seed_data.sql` (update user IDs first — see instructions in the file)

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase project URL and anon key from **Settings > API**.

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/imtglobal/dashboard`.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect to demo org
│   └── [orgSlug]/
│       ├── layout.tsx          # Org shell (nav, context)
│       ├── dashboard/page.tsx  # Dashboard
│       ├── contacts/
│       │   ├── page.tsx        # Contacts list
│       │   └── [id]/page.tsx   # Contact 360
│       └── interactions/page.tsx
├── components/
│   ├── ui/                     # Shared UI (nav, modal, filter)
│   ├── dashboard/              # Dashboard view
│   ├── contacts/               # Contact list, 360, add modal
│   ├── interactions/           # Interaction list, log modal
│   └── csv/                    # CSV import with column mapping
├── lib/
│   ├── types.ts                # TypeScript types + constants
│   ├── supabase.ts             # Supabase client (browser + server)
│   ├── queries.ts              # All database queries
│   ├── utils.ts                # Formatting, date helpers, colors
│   └── org-context.tsx         # React context for org/membership
└── sql/
    ├── 01_schema.sql           # Tables, RLS, indexes
    └── 02_seed_data.sql        # IMT Global demo data
```

## Key Design Decisions

- **Path-based multi-tenancy**: `/[orgSlug]/` routing, RLS handles data isolation
- **Forecast is calculated**: `ask_amount × probability`, never stored
- **Stewards are app users**: linked via memberships table, not free text
- **Auto-update next action**: logging an interaction updates the contact's next action
- **All stewards see all contacts**: dashboard defaults to showing your own portfolio

## Auth

Auth is stubbed out — the layout falls back to the first membership for demo purposes.
To add your existing Supabase Auth, you need to:
1. Replace the auth fallback in `[orgSlug]/layout.tsx` and page files
2. Add your login/signup pages
3. Add middleware to protect `[orgSlug]/*` routes

## Deploy to Render

1. Push to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
