# Security Deployment Notes

Complete these Supabase/dashboard items before public deployment.

## Supabase Auth

- Disable Google under Authentication > Providers.
- Keep Email enabled.
- Enable "Confirm email" so new users must verify before sign-in.
- Set production Site URL to:
  - `http://laundrykingWDF.com`
- Add redirect URLs:
  - `http://laundrykingWDF.com/login?verified=1`
  - `http://laundrykingWDF.com/reset-password`
- Remove localhost URLs from the production Supabase project.

## RLS Policy Requirements

Keep RLS enabled on `users`, `orders`, `inventory`, `transactions`, and the future `expenses` table.

Policy intent:
- `users`: authenticated users can select/update only `id = auth.uid()`.
- `orders`: customers can select/insert their own rows only; admins can select/update all rows.
- `inventory`: admin-only select/insert/update/delete.
- `transactions`: customers can select their own rows only; admin/service can manage records. Do not allow broad public inserts.
- `expenses`: create this table for typed expense history, then allow admin/service access only.

The Express API now verifies Supabase sessions and admin role server-side for admin endpoints. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.

## Environment

- Local secrets belong in `.env`, which is ignored.
- Commit only `.env.example`.
- Production must set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PUBLIC_SITE_URL=http://laundrykingWDF.com`
  - `CORS_ORIGINS=http://laundrykingWDF.com`

## HTTPS

Deploy frontend and API behind HTTPS on the same origin when possible. Once the certificate is active, update Supabase URL configuration and `CORS_ORIGINS` to the HTTPS origin. If split across domains, configure CORS only for the production frontend origin.
