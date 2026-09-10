# Phase 1 — Real Backend Foundation + AI

This branch adds a production-oriented foundation for Jharkhand Innovation Connect.

## What changed

- Supabase-ready authentication with persistent sessions.
- Real sign-in and account creation UI.
- Demo-role login remains available when Supabase environment variables are not configured.
- Profile table with role and verification fields.
- Challenge, evidence, university, project, industry, collaboration, notification, impact and audit tables.
- Row Level Security policies for authenticated access.
- `pgvector` extension and challenge embedding column prepared for semantic duplicate detection.
- Secure server-side AI analysis endpoint at `api/ai/analyze.ts`.
- Challenge AI now sends title, description and affected population to the server-side model and expects structured JSON.
- Deterministic local fallback keeps the demo functional when AI credentials are unavailable.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Storage**, create a private bucket named `challenge-evidence`.
4. In Supabase **Authentication**, configure your email provider. For local SIH testing, email confirmation can be disabled temporarily.
5. Copy `.env.example` to `.env.local`.
6. Fill in the browser-safe values:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

7. For Vercel, add these server-side environment variables in Project Settings → Environment Variables:

```text
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-5-mini
```

`OPENAI_API_KEY` must never be prefixed with `VITE_`, placed in frontend code, or committed to GitHub.

8. Start the app with `npm install` and `npm run dev`.

## AI workflow

`Submit Challenge` → `/api/ai/analyze` → OpenAI structured JSON → domain + priority + impact + skills + technologies + duplicate risk → existing AI result UI.

If the server endpoint is unavailable, the frontend falls back to the local deterministic classifier instead of breaking the submission flow.

## Role security

New real accounts are intentionally created as `citizen`. University, student, faculty, industry and government roles should be assigned only after verification/admin approval. The role selector in demo mode is not an authentication mechanism.

## Next AI phase

The next upgrade should use `pgvector` embeddings against persisted challenges for semantic duplicate detection, followed by AI-assisted institution/industry matching and solution recommendations.
