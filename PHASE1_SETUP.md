# Phase 1 — Real Backend Foundation

This branch adds the first production-oriented foundation for Jharkhand Innovation Connect.

## What changed

- Supabase-ready authentication with persistent sessions.
- Real sign-in and account creation UI.
- Demo-role login remains available when Supabase environment variables are not configured.
- Profile table with role and verification fields.
- Challenge, evidence, university, project, industry, collaboration, notification, impact and audit tables.
- Row Level Security policies for authenticated access.
- `pgvector` extension and challenge embedding column prepared for Phase 2 duplicate detection.
- Persistent challenge service added for the next submission-page integration step.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Storage**, create a private bucket named `challenge-evidence`.
4. In Supabase **Authentication**, configure your email provider. For local SIH testing, email confirmation can be disabled temporarily.
5. Copy `.env.example` to `.env.local`.
6. Fill in:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

7. Start the app with `npm install` and `npm run dev`.

## Role security

New real accounts are intentionally created as `citizen`. University, student, faculty, industry and government roles should be assigned only after verification/admin approval. The role selector in demo mode is not an authentication mechanism.

## Next Phase 1 step

Connect `src/services/challengeService.ts` to the existing five-step challenge submission form, then add real Storage uploads and browser geolocation. After that, Phase 2 can add embeddings/AI classification and duplicate detection.
