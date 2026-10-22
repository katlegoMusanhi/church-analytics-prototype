# Neon staging — Church Growth Intelligence

**Status (22 October 2026): STAGING DATABASE INITIALIZED.** Not deployed to production. The public GitHub Pages demo is unchanged and still uses fictional browser-local records.

## Legal operating jurisdiction (decision: Botswana first)

As agreed 22 October 2026, Botswana is the proposed initial operating jurisdiction. This does **not** establish incorporation or statutory compliance. The Botswana Data Protection Act, 2024 (Act 18 of 2024, commenced 14 January 2025) is the primary framework. Religious affiliation may be sensitive personal data, and the existing AWS **us-east-1** hosting choice requires Botswana-to-US transfer review before any real individual records. Do not invite Botswana churches to enter member data until Botswana legal counsel and our compliance checklist approve the pilot.

See `compliance/COMPLIANCE_REGISTER.md` and `compliance/LEGAL_NOTICES_DRAFT.md` for the Botswana-first gates and draft legal notices.

## Connected staging resource

- Neon project name: Church Growth Intelligence - Staging
- Neon project ID: `bitter-silence-83181490`
- Database: `churchgrowth_staging`
- Default branch: `main` (`br-rough-thunder-b8twjjkf`)
- Cloud region: `aws-us-east-1` — reassess data residency before collecting actual church records.
- Auth: Neon managed Better Auth (provisioned).
- Data API: enabled, limited to the `public` schema and a CORS origin of `https://katlegomusanhi.github.io`.
- Schema migration: `neon/migrations/001_church_growth.sql`.
- Project access is via the connected Neon integration; **do not commit connection strings, passwords, service credentials or tokens**.

## Applied and verified

The migration was executed successfully as one 40-statement transaction against a previously empty staging application schema. Five application tables were created:

1. `churches`
2. `church_memberships`
3. `outreach_campaigns`
4. `first_visits`
5. `follow_up_tasks`

Verified **Row-Level Security enabled for all five**. Verified eleven role-scoped policies, authenticated read/write grants only for operational tables, no public or anonymous table access, and identity-preserving triggers on campaigns, visits and tasks. A policy correction moved `church_memberships` identity comparisons into an `app_private` security-definer function because the ordinary authenticated role has no direct access to Neon's managed `auth` schema.

Negative access checks passed:
- Anonymous role denied querying `outreach_campaigns` and `churches`.
- Authenticated role without signed-in JWT saw **zero** rows in churches, memberships, campaigns and tasks.
- An authenticated client cannot create a church directly.

## NOT YET VERIFIED

- Cross-church access **with actual signed-in users**: requires two real test users and two fictional church memberships created through a trusted admin process; currently **no application churches/visitors have been provisioned**.
- True email/password UI login, logout and JWT-based browser sessions have not been connected to the application.
- Invite-only enrollment: Neon Auth currently defaults to `allow_sign_up=true`, `verify_email_on_sign_up=false`. No public login UI is exposed yet and newly registered users have **no church membership**, but these defaults must be tightened before a controlled pilot. Available connector actions did not expose those options for updating. Use Neon Auth settings or a managed invitation strategy before signups.
- App API integration, error/loading states, backups, appropriate region/data processing terms, audit logs and retention policies.
- Cross-tenant positive/negative integration tests and real-browser E2E tests.

## Next steps

1. Secure authentication settings and trusted-domain policies; do not publicly expose signup until policy is approved.
2. Create two authorized testing identities and two explicitly fictional churches in staging. Never paste passwords into chat or source code.
3. Assign memberships **through a trusted server-side administrative workflow**, not via a browser route.
4. Use authenticated Data API tokens to run an isolation matrix. Church A must never see or modify Church B's records.
5. Only after tests succeed: build a separate opt-in authenticated staging app mode with typed queries. Do not replace or connect the current public demo automatically.
6. Get privacy/security approval before any genuine member or religious data is recorded.

## Security boundary

The selected architecture uses database RLS, but **security is not proven by table/policy existence alone**. Ordinary direct database owner connections bypass RLS. Only signed-in Data API calls with a role correctly mapped to `authenticated` are valid tests of church isolation. Keep administrative database credentials server-side.

*The public marketing site and its functional fictional demo remain on GitHub Pages main; migration development remains on GitHub branch `neon-staging`.*
