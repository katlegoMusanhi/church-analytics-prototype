# Church Growth Intelligence — Backend Foundation

**Status:** Schema authored on the `backend-foundation` Git branch. **Not deployed** and **not connected to the public GitHub Pages demo**.

## Goal and boundaries
Build the smallest secure backend for the journey **outreach campaign → first visit → follow-up → return**, for multiple independent churches. Do **not** import real membership, contact information, notes about religion, or any sensitive visitor data during this phase.

## Proposed stack
- **Supabase Auth** for signed-in church staff
- **PostgreSQL** for campaign, visitor and task records
- **Row Level Security (RLS)** to restrict church members to their own church
- **Trusted server-only provisioning** for creating churches, memberships and changing user roles
- Existing **GitHub Pages** for public marketing and the fictional demo; authenticated product hosting/integration comes later

Supabase is a proposed platform, not an account or database already created.

## Data model

| Table | Contents | Who can read | Who can edit |
| --- | --- | --- | --- |
| `churches` | Name, ID | Church member | Trusted server provisioning only |
| `church_memberships` | User, church and role | Each user sees their own memberships | Trusted server provisioning only |
| `outreach_campaigns` | Campaign, channel, date, estimated reach and spend | Member of this church | Owner, admin, editor |
| `first_visits` | Pseudonymous ID, reported campaign, first visit, return date | Member of this church | Owner, admin, editor |
| `follow_up_tasks` | Visit ID, type, team, due/completed dates | Member of this church | Owner, admin, editor |

The `viewer` role has read-only access to the three operational tables. Browser clients have no delete privileges. Composite foreign keys prevent linking a visitor or task to another church's records. Update triggers prevent moving rows between churches.

## Run in staging (not production)

1. Create a **new staging** Supabase project under your own account and enable email authentication for invited staff.
2. Apply `supabase/migrations/202610220001_backend_foundation.sql` using a migration runner or Supabase SQL editor operated by a database administrator.
3. Verify all five tables show **RLS enabled**. Confirm policy ownership and security-definer functions under `private` are owned by the trusted database role; never let ordinary users alter them.
4. Create at least **two test users and two test churches** using administrative provisioning. Associate the first test user with Church A as `editor`, the second with Church B as `viewer`. For more complete role testing, create an A viewer and a B editor as well.
5. Use signed-in JWT-backed client requests to execute the tests in `backend/TEST_PLAN.md` and record actual outcomes. **Do not use the service-role credential for a client-side RLS test:** it bypasses RLS.
6. Turn on backups, inspect project region/data-location requirements, review retention/erasure and access logs, and approve policies before any real church pilot.
7. Only after the above, integrate the existing four demo screens through an explicit **signed-in mode**. Keep the current fictional browser-local demo as a separate nonproduction mode.

## Security rules

- Never put the Supabase **service role key** or admin credentials in `index.html`, `app.html`, `mvp.js`, public GitHub, or source maps.
- It is normal for a **Supabase publishable/anon key** to appear in frontend code, but that is safe only with correct RLS, scoped grants, authenticated sessions and tested access policies.
- Do not create an `INSERT` policy that allows a user to add themselves as an owner to `church_memberships`. Membership lifecycle needs a separately designed trusted server action or invitation flow.
- Church name and staff identity are account data; production privacy and processing notices are still needed.
- When implementing a shared staff workspace, define who may invite/revoke other staff, whether a viewer can export, and whether owners can transfer or delete church data.
- First visits are **pseudonymous**, not anonymous in a legal/privacy sense. Do not repurpose them to store actual names or contact details until there is an approved lawful basis, access model and retention policy.
- Outreach reach represents approximate **encounters**, not unique individuals. 30-day return rates should only count cohorts whose full 30-day window has elapsed.
- The SQL migration intentionally contains **no production keys, passwords, real names or email addresses**.

## Backend implementation sequence

**Phase 1 (in this branch):** schema, church-isolation RLS, constraints and test checklist.

**Phase 2:** Supabase staging provision, invite-only auth, trustworthy church onboarding, RLS integration tests and migration validation.

**Phase 3:** Connect Overview, Campaigns, Visitors and Follow-ups through a typed client/data layer. Provide a clear toggle between fictional demo and signed-in real mode; never sync data silently.

**Phase 4:** Auditability, backup/restore and retention, error/empty/loading states, mobile QA and a private pilot with limited church staff.

## Repo links
- Existing published fictional frontend: https://katlegomusanhi.github.io/church-analytics-prototype/
- Backend branch: https://github.com/katlegoMusanhi/church-analytics-prototype/tree/backend-foundation
- Migration: `supabase/migrations/202610220001_backend_foundation.sql`

**Success gate:** Do not connect or onboard a real church until a church A staff member is demonstrably unable to read, create or modify church B data using ordinary signed-in client credentials, and the role matrix has passed all positive and negative cases.
