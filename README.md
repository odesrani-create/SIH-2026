# React + TypeScript + Vite

## Supabase setup

The app can run without Supabase using local browser storage. To enable shared challenge data:

1. Create a Supabase project and install dependencies with `pnpm install`.
2. Authenticate the project-local CLI with `pnpm supabase login`, then link the project with `pnpm supabase link --project-ref your-project-ref`.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and the browser-safe `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Restart the Vite dev server.

The login and signup screens use Supabase Auth when these variables are configured. New accounts also create a row in the `profiles` table, including the selected role and organization. Enable email confirmation in the Supabase Auth settings if you want users to verify their email before signing in. The built-in demo accounts remain available for local prototype access.

To enable server-side AI analysis:

```bash
pnpm supabase functions deploy analyze-challenge --use-api --no-verify-jwt
pnpm supabase secrets set OPENAI_API_KEY=your-openai-api-key
pnpm supabase secrets set OPENAI_MODEL=gpt-4o-mini
```

Then set `VITE_USE_AI_EDGE_FUNCTION=true`. The browser never receives the provider key. If the function is unavailable, the app uses its local deterministic analyzer. Never put an OpenAI key in `OPENAI_MODEL`; that variable must contain a model name.

If a provider key or Supabase access token was pasted into a terminal, chat, commit, or log, revoke it in the provider dashboard and issue a replacement before deploying.

Challenge validation checks the demo records and all stored Supabase submissions for similar title, description, domain, and location signals. Evidence files are uploaded to the private `challenge-evidence` bucket when Supabase is configured. The client only uses the public anon key; production deployments should replace the open insert policies with authenticated users or an Edge Function and add signed download policies for reviewers.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
