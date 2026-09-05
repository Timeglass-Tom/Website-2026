# Email program audit — September 2026

`email-program-audit-2026-09.html` is the audit deliverable: a self-contained
interactive dashboard covering every email Timeglass sends from Customer.io.

- **Scope**: all 67 configured emails across 11 automations, 2 broadcasts and
  7 transactional messages in workspace 202279.
- **Windows**: inventory is all-time; performance is lifetime with a 90-day
  toggle (2026-06-06 → 2026-09-04).
- **Data pulled**: 2026-09-04, from the Customer.io API only.
- **Published as an artifact**: https://claude.ai/code/artifact/e6265e2a-84b0-4158-972f-5f1af593446a

The file is static HTML with no build step and no external dependencies beyond
a Google Fonts stylesheet. Open it directly in a browser.

## What this audit could not measure

Recorded here so the numbers are not over-read. The dashboard's Method page
carries the full list.

- Product analytics, GA, CRM and the sales spreadsheet were not connected, so
  there is no post-click behaviour, no activation data and no revenue
  attribution for any email.
- Customer.io Deliverability Analytics is not on this plan, so inbox placement
  and ISP-level breakdown are unavailable.
- The onboarding campaign has no conversion goal configured, so its reported
  zero conversions are a configuration fact, not a performance result.
- The competitor teardown was not performed. It requires subscribing to
  competitor lists over several weeks; this environment has no outbound web
  access beyond search.
- Mobile rendering was assessed from template code, not from rendered devices.
