# Production Deployment Checklist

Use this with a fresh database backup and the `codex-production-readiness-safety`
branch before deploying to production.

## Supabase Auth

These are dashboard changes and are not stored in this repo:

- Authentication > Providers: disable Google.
- Authentication > Providers: keep Email enabled.
- Authentication > Sign In / Providers: enable email confirmation before login.
- Authentication > URL Configuration > Site URL:
  - `http://laundrykingWDF.com`
- Authentication > URL Configuration > Redirect URLs:
  - `http://laundrykingWDF.com/login?verified=1`
  - `http://laundrykingWDF.com/reset-password`
- Remove localhost redirect URLs from the production Supabase project.

## Database

Apply `supabase/migrations/202605220001_production_rls_and_expenses.sql` after
creating a Supabase backup. The migration creates `public.expenses` if missing,
enables RLS, adds managed `lk_` policies, and preserves existing data.

Rollback: remove only policies prefixed with `lk_` and the
`public.current_user_is_admin()` function. Keep `public.expenses` unless its rows
have been backed up/exported.

## Environment Variables

Set these in Vercel, Render, or Railway without overwriting existing production
values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SITE_URL=http://laundrykingWDF.com`
- `CORS_ORIGINS=http://laundrykingWDF.com`

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not add it to client code or any
`VITE_` variable.

## Platform Notes

- Vercel: add the environment variables in Project Settings > Environment
  Variables. Use `pnpm build`. This repo's `vercel.json` only defines build
  metadata and does not store secrets.
- Render: `render.yaml` marks Supabase secrets as `sync: false`, so add them in
  the Render dashboard.
- Railway: `railway.json` defines build/start commands only. Add all variables
  in Railway Variables.

## HTTPS

Enable the production custom domain certificate at the hosting provider. Once
HTTPS is active, update Supabase Site URL, redirect URLs, `PUBLIC_SITE_URL`, and
`CORS_ORIGINS` to `https://laundrykingWDF.com`.
