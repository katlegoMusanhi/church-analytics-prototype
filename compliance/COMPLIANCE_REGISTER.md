# Church Growth Intelligence — Legal, Privacy and Compliance Register

**Established:** 22 October 2026 | **Owner:** Product founder (appoint a named compliance owner before pilot) | **Status:** OPEN — not certified or legally approved.

**Purpose:** Compliance-by-design for an outreach analytics SaaS serving multiple independent churches. This register is a product-engineering plan, not a legal opinion. A qualified practitioner in every target jurisdiction must approve applicability, lawful bases, contracts, transfers, notices and launch readiness.

## Jurisdiction decision — Botswana first (22 October 2026)

**Confirmed product direction:** Botswana is the initial proposed jurisdiction of operation and the priority country for legal review, product policies, pilot agreements and launch controls. This does **not** assert that the operator is already incorporated, registered or licensed in Botswana; legal entity identity remains outstanding (L01). Zimbabwe, South Africa, EU/UK and other markets are expansion jurisdictions, not part of the initial operating assumption. Applicable foreign law must still be assessed if users, customers, processing or vendors trigger it.

**Primary statute:** Botswana Data Protection Act, 2024 (Act No. 18 of 2024), in force **14 January 2025**. It expressly identifies information revealing religious beliefs as sensitive personal data. Sections 30–31 contain specific rules and conditions for sensitive-data processing, including provisions relevant to non-commercial religious bodies; **do not assume these provisions automatically authorize an independent commercial SaaS provider or transfer to it**. Obtain Botswana counsel review before using identifiable church-visitor records.

**Immediate release blockers:** determine operator legal entity and privacy contact; assess statutory registration and accountability obligations; map controller/processor roles; establish an appropriate basis and condition for each personal/sensitive-data purpose; complete a privacy impact assessment; draft Botswana-focused privacy notices, DPA and terms; audit cookies/browser storage; implement retention and data-subject request processes; test staff authentication and church-isolation RLS; obtain a Botswana-to-US transfer assessment and any required mechanism before using the existing Neon staging database for real data.

**Data-residency decision pending:** Neon staging is in AWS US East. It remains restricted to schema and fictional tests until the cross-border transfer decision is approved. Select an appropriate region and vendors based on legal review, not merely technical convenience.

**Primary reference:** https://botswanalaws.com/consolidated-statutes/principle-legislation/data-protection (includes Act 18 of 2024 and commencement date); commencement SI 4/2025. All actual compliance requirements and exceptions must be confirmed with qualified Botswana legal counsel.

## 1. Operating model and risk classification

- Proposed default: each church determines the purposes of processing its members'/visitors' information (potential **controller**); Church Growth Intelligence processes data under documented instructions (potential **processor**). Review this per feature; the SaaS operator can be an independent controller for account, billing, security and marketing data.
- Records about church engagement, conversion and follow-up can directly or indirectly reveal **religious belief/affiliation**. Pseudonymous IDs are still potentially personal information if linked to an individual elsewhere. Treat identifiable member/visitor records as **sensitive/special-category data**, subject to local law.
- Current public app is fictional and browser-local; **do not collect actual visitor records yet**. Existing staging Neon database contains schema only, no real church records.
- Geography: establish initial country of operation and customer coverage before launch. Candidate review jurisdictions: Botswana, Zimbabwe, South Africa if targeted, plus GDPR/UK GDPR and ePrivacy rules where applicable. A foreign SaaS customer and a US-hosted database can trigger cross-border transfer analysis.
- Staging Neon project is in **AWS us-east-1**; do not assume this region is suitable for actual member data.

## 2. Launch-gated compliance backlog

| ID | Area | Engineering/legal acceptance evidence | Gate | Status |
| --- | --- | --- | --- | --- |
| L01 | Entity and contact | Verify operator legal name, registration, address, notice/contact channel and accountable privacy contact | Before public legal notices | OPEN |
| L02 | Data inventory and flow map | Document every field/source/recipient, purpose, storage location, transfer and retention including Neon Auth, CDN, fonts, images and analytics | Before pilot | OPEN |
| L03 | Controller/processor roles | Determine each party's responsibilities for visitor, staff and platform data; reflect in DPA/Terms | Before pilot contracts | OPEN |
| L04 | Lawful basis and sensitive religious data | Per-purpose lawful basis and any additional sensitive-data condition verified for each target jurisdiction; no generic blanket consent assumption | Before real visitor processing | BLOCKING |
| L05 | Privacy impact assessment | DPIA/PIA documenting risk, safeguards, residual risk, approvals and re-review triggers | Before real visitor processing | BLOCKING |
| L06 | Privacy notice | Accurate, plain-language notices for website visitors, church admins/staff and church visitors; subject rights, transfers, recipients, retention, contact | Before relevant collection | OPEN |
| L07 | Cookie/storage inventory | Inventory HTTP cookies, localStorage/sessionStorage, embedded assets, third-party scripts, categories and expiration; verify with browser network audit | Before cookie banner design | OPEN |
| L08 | Cookie preferences | Do not load non-essential tracking before applicable consent; equivalent accept/reject choices where required; granular preferences, withdrawal and versioned evidence | Before non-essential tracking | BLOCKING IF APPLICABLE |
| L09 | Website terms | Draft Terms of Use and accurate prototype/disclaimer language; accessibility, acceptable use and IP clauses | Before public customer signup | OPEN |
| L10 | SaaS terms and DPA | Processing instructions, confidential handling, sub-processors, security schedule, audit cooperation, deletion/return and breach response | Before pilot customer data | BLOCKING |
| L11 | Sub-processors / vendors | Inventory Neon, GitHub Pages, font/CDN/image providers, email provider, hosting, payment and analytics; review terms and data handling | Before pilot | OPEN |
| L12 | International transfers | Validate origin/destination law and transfer mechanism/authorisation where required; choose compliant hosting regions | Before pilot | BLOCKING |
| L13 | Authentication and tenancy | Require verified staff identity, approved provisioning, role matrix, tested RLS, session security and tenant-isolation tests | Before real login | BLOCKING |
| L14 | Data minimization and purpose limitation | Default to pseudonymous IDs and aggregated metrics; disable arbitrary sensitive free-text, bulk export and third-party sharing unless justified | Every feature | OPEN |
| L15 | Consent and withdrawal where applicable | Explicit, purpose-separated collection and audit trail for visitor contact/outreach where legally required; easy withdrawal without affecting essential service | Before contact workflows | BLOCKING |
| L16 | Minors and vulnerable people | Age policy, child-data rules, authorised guardianship where required; design consent/age controls before any children records | Before children data | BLOCKING |
| L17 | Retention and deletion | Per-category schedules, church-wide export/deletion, DSAR workflows, backups expiry, account close-out evidence | Before pilot | BLOCKING |
| L18 | Security and incidents | Least privilege, encryption, secrets, logging, monitoring, access review, backup/restore testing, incident response and legally applicable reporting timelines | Before pilot | BLOCKING |
| L19 | Data subject rights | Authenticate requests; access, correction, deletion, objection, portability where applicable, request logging and response SLA | Before pilot | OPEN |
| L20 | Marketing communications | Consent or other lawful basis, unsubscribe, preference center, suppression, opt-out evidence and separation from pastoral care | Before email/SMS | BLOCKING |
| L21 | Billing and commerce | Fees, currencies, renewals, tax/VAT, refund/cancellation rules, merchant terms and country-level consumer/contract requirements | Before paid plans | DEFERRED |
| L22 | Public representations | Avoid promises of full security, GDPR certification, anonymous data, clinical-level impact, or retention causality without evidence | Every release | OPEN |
| L23 | Accessibility | Keyboard/focus testing, contrast, responsive usability, meaningful errors and plain-language notices | Before pilot | OPEN |
| L24 | Legal review and approval | Named qualified counsel/privacy adviser signs off target-country requirements and dated version of all policies | Before real-data pilot | BLOCKING |

## 3. Cookie and storage inventory — current observed code (verify via actual browser)

| Technology | Purpose | Potential storage/tracking | Current assessment/action |
| --- | --- | --- | --- |
| App `localStorage` key `church-growth-focused-mvp-v1` | Persist fictional demo workspace changes in the visitor's browser | Yes, persistent browser storage; not an HTTP cookie | Disclose in Cookie/Storage Notice; verify strict necessity and jurisdictional treatment. Provide Reset Demo control |
| Google Fonts served from Google domains | Typography | Remote request; potential IP/network metadata | Review vendor, alternatives and whether self-hosting removes unnecessary requests |
| Unsplash remote hero/community image | Illustrative marketing imagery | Remote request; possible provider metadata | Review license, vendor transfer/privacy exposure and consider hosting approved static assets |
| Neon Auth session mechanisms (future signed-in staging mode) | Required login/security | To be audited on integration | Inventory names, durations, domains, SameSite, HttpOnly, Secure flags and legal exemption justification |
| Analytics/ads trackers | Not confirmed present in reviewed static app | Do not presume absent until browser/network audit | Do not add until necessity, consent and policy reviewed |
| Other third-party embeds | None intentionally added to simplified homepage | Need page-level network inspection | Inspect production and staging builds |

**Implementation rule:** Do **not** display a decorative "Accept all cookies" banner when there are no optional categories to accept. First inventory technologies, then implement an honest notice and conditional preferences manager. No non-essential analytics/marketing scripts may initialize before valid permission where required. Offer a visible "Cookie settings" reopening control and keep notices current as providers change.

## 4. Country-by-country review

### Botswana
Data Protection Act 2024 (Act 18 of 2024), commenced 14 January 2025 per Botswana Laws. Determine regulator registration, sensitive-data processing conditions, required DPIA, notices, international transfer controls and specific applicable obligations with local counsel.

### Zimbabwe
Cyber and Data Protection Act, 2021 [Cap. 12:07]. Statutory definition expressly includes religious beliefs/affiliations as sensitive data. Review written consent and statutory exceptions, registration/licensing requirements, cross-border processing, DPO and other obligations with Zimbabwean counsel. Do not assume churches automatically qualify for an exemption applicable to their outsourced SaaS processor.

### South Africa if targeted
Protection of Personal Information Act (POPIA) includes special rules for information revealing religious beliefs, with defined religious-organization exceptions and third-party disclosure restrictions. Confirm conditions and contracts before onboarding SA customers.

### EU / UK if targeted
GDPR Article 9 special-category processing applies to religious beliefs where GDPR applies. Cookie and similar-technology consent/exception frameworks differ by jurisdiction; UK ICO guidance treats device storage technologies broadly, not only HTTP cookies.

## 5. Development definition of done

A feature is **not done** until:
1. Data fields and uses are described in a field-level inventory.
2. Controller/processor purpose and lawful basis are reviewed.
3. Religious/sensitive or children's data risk is classified.
4. Consent/notice and cookie requirements are assessed (if applicable).
5. Staff/tenant access rules and negative tests pass.
6. Retention/deletion is implemented or expressly blocked until ready.
7. Third-party vendors/transfers and relevant agreements are reviewed.
8. Acceptance evidence and owner are recorded in this register.

## 6. Verified source starting points (legal review required)

- Botswana statute: https://e-laws.botswanalaws.com/principal-legislation/data-protection/
- Zimbabwe statute: https://zimlii.org/akn/zw/act/2021/5
- South African POPIA s26: https://www.acts.co.za/protection-of-personal-information-act-2013/26__prohibition_on_processing_
- EU GDPR Article 9: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0679-20160504
- UK ICO storage/cookies guidance: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/

## 7. Release rules

- **Public fictional demo:** permitted while clearly labeled and reviewed for third-party technology, communications and prototype claims. No real visitor/member data.
- **Private staging with fictional test users:** allowed for controlled development; restrict public signup.
- **Private real-church pilot:** BLOCKED until L04, L05, L10, L12, L13, L15 where applicable, L16 where applicable, L17, L18 and L24 are cleared.
- **Commercial production:** blocked until all applicable obligations, agreements, incident response, billing and privacy controls are approved.

**Evidence status as of 22 Oct 2026:** Register created; statutory references checked; no qualified legal sign-off claimed.