# Row-Level Security and Workflow Acceptance Tests

**Execution status:** Not run. This plan requires a real staging Supabase database and authenticated test users. No live backend exists in the current repository.

## Fixture setup (trusted admin only)

Create Church A and Church B. Use four distinct Supabase Auth users:

| Test user | Membership | Role |
| --- | --- | --- |
| A-editor | Church A | editor |
| A-viewer | Church A | viewer |
| B-editor | Church B | editor |
| Outsider | No membership | none |

Use a secure administrator session or trusted provisioning service to create these memberships. Never expose the admin/service key to the website.

As A-editor create sample Campaign A, First Visit A and Task A. As B-editor create Campaign B, First Visit B and Task B. No real personal data.

## Essential negative security tests

Execute every test using a **normal authenticated client session and that user's access token**. Confirm status/error as well as row counts (do not mistake an empty result for a failed query when a client SDK reports no error).

| Test | User | Expected |
| --- | --- | --- |
| Read campaigns with no filter | A-editor | Campaigns for Church A only |
| Read visits and tasks with no filter | A-editor | Church A only |
| Read churches | A-editor | Church A only |
| Read memberships | A-editor | Own membership records only |
| Read all operational rows | Outsider | Empty result |
| Read B campaign by known UUID | A-editor | No row returned |
| Insert campaign specifying Church B ID | A-editor | Denied by RLS |
| Insert visit referencing a Church B campaign | A-editor | Denied by RLS or composite foreign key |
| Insert task referencing a Church B visitor | A-editor | Denied by RLS or composite foreign key |
| Update A campaign to Church B ID | A-editor | Denied by immutability trigger |
| Update A visit to Church B ID | A-editor | Denied by immutability trigger |
| Update A task to Church B ID | A-editor | Denied by immutability trigger |
| Update B campaign's title using known UUID | A-editor | No change |
| Insert, update or delete church membership | A-editor | Permission denied |
| Create a church directly | A-editor | Permission denied |
| Delete any operational record | A-editor | Permission denied |
| Change A campaign / visit / task | A-viewer | Denied |
| Read A campaign / visit / task | A-viewer | Allowed |
| Read anything after sign-out | Anonymous user | Denied or no rows |

## Essential positive workflow tests

1. A-editor creates an outreach campaign in Church A, including channel, date, estimated reach and spending.
2. A-editor records a first visit linked to that campaign. The visitor has a pseudonymous ID only.
3. A-editor creates a follow-up task, then marks it completed.
4. A-editor records a return date no earlier than the first-visit date.
5. A-editor reads all records and verifies each belongs to Church A.
6. A-viewer can read but not edit those records.
7. B-editor cannot see the data created by A-editor, even when the UUID is known.
8. The frontend recalculates return rates only for visits at least 30 days old. An immature cohort must never be counted as a zero-return eligible cohort.
9. Verify absence of member names, emails, contact details, religious affiliations and freeform sensitive notes from tables.
10. Test concurrent creation by two authenticated users in the same church, and a lost-network retry (avoid accidental duplicate submissions).

## Database invariants to check

- \`church_id\` is immutable on campaign, first-visit and follow-up rows.
- Campaign/visitor and visitor/task composite foreign keys never cross church boundaries.
- \`returned_on\` is not earlier than \`first_visit_date\`.
- Unique visitor codes are enforced per church.
- Campaign reach and spend cannot be negative.
- User roles are one of \`owner\`, \`admin\`, \`editor\` and \`viewer\`.
- There is no client-side permission to delete or change memberships.
- No publicly executable administrative invitation or provisioning function is exposed.

## Example permission inspection SQL (run as admin in staging)

\`\`\`sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in
    ('churches','church_memberships','outreach_campaigns','first_visits','follow_up_tasks')
order by tablename;

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in
    ('churches','church_memberships','outreach_campaigns','first_visits','follow_up_tasks')
order by tablename, policyname;
\`\`\`

**No production go-live until the above has been exercised on a real staging database and results recorded.**
