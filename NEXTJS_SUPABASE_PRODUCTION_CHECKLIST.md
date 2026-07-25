# Next.js + Supabase Production Checklist: 10 Checks Before Launch

A free, source-backed review for developers shipping Next.js with Supabase. Each item includes a concrete action and links to official documentation.

> Educational guidance only. This is not a security audit, penetration test, compliance review, or guarantee that an application is secure or bug-free.

[Read the browser version](https://cekuu35.github.io/nextjs-supabase-production-checklist/?utm_source=github_resource_md&utm_medium=referral&utm_campaign=launch_checklist)

## 1. Keep secret and service-role keys on the server

Supabase publishable or legacy anon keys are designed for public clients when Row Level Security protects the data. Secret and service-role keys grant elevated access and must never be exposed in browser code.

**Action:** Search client bundles and public environment variables for secret or service-role credentials, rotate any exposed key, and move privileged calls to a trusted server.

Source: [Official Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys)

## 2. Enable RLS on every exposed table

Tables reachable through Supabase's Data API need Row Level Security. Dashboard-created tables enable it by default, but tables created another way still need verification.

**Action:** Inventory every table in exposed schemas and confirm RLS is enabled before production traffic reaches it.

Source: [Official Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 3. Write explicit, least-privilege policies

Enabling RLS without policies blocks client access; broad policies can expose more rows or operations than intended. Separate read, insert, update, and delete rules where permissions differ.

**Action:** Document which role can perform each operation, then make each policy express that rule directly.

Source: [Official Supabase data security guide](https://supabase.com/docs/guides/database/secure-data)

## 4. Test data access as a normal user

Admin tools and service-role clients bypass controls that ordinary sessions must satisfy. A test that only uses privileged access cannot validate the customer path.

**Action:** Create two test users and verify that each can access their own allowed rows, cannot access the other's rows, and cannot call restricted operations.

Source: [Official Supabase API security guide](https://supabase.com/docs/guides/api/securing-your-api)

## 5. Set the production Site URL and allowed auth redirects

OAuth, magic-link, confirmation, and password-reset flows depend on redirect configuration. Development wildcards should not silently become the production trust boundary.

**Action:** Set the production Site URL, allow only the redirect destinations you use, and run each email or OAuth flow against the real domain.

Source: [Official Supabase redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls)

## 6. Review the browser/server environment boundary

Next.js variables prefixed with `NEXT_PUBLIC_` are inlined into browser JavaScript. Treat them as public and keep secrets in server-only variables.

**Action:** List every production variable, mark it public or server-only, remove unused values, and confirm environment files are excluded from version control.

Source: [Official Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## 7. Authorize every server-side mutation

Hiding a button or redirecting a page improves the interface, but it does not authorize the underlying Server Action, Route Handler, or database operation.

**Action:** Authenticate and authorize inside every mutation path, then test direct requests without relying on the UI.

Source: [Official Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## 8. Ship metadata and crawl controls intentionally

Production pages need titles and descriptions; public products also benefit from Open Graph metadata, a sitemap, and robots directives. Private routes should not be made discoverable by accident.

**Action:** Inspect rendered metadata for important pages and verify `sitemap.xml` and `robots.txt` match the intended public surface.

Source: [Official Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## 9. Test the production build, not only dev mode

Development mode can hide differences in caching, bundling, environment variables, and runtime behavior. A successful local dev session is not a production verification.

**Action:** Run the production build and start commands, inspect build output, exercise critical routes, and review Lighthouse plus runtime logs.

Source: [Official Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## 10. Exercise failure paths before customers do

Launch readiness includes expired sessions, missing rows, rejected writes, unavailable services, slow requests, and unknown routes—not just the happy path.

**Action:** Trigger representative 401, 403, 404, validation, and dependency-failure cases; confirm the user gets a safe message and operators get useful logs.

Source: [Official Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

---

## Optional full checklist

The paid version expands this free guide to **60 practical checks across seven areas**. It is one **8-page PDF (117 KB)** delivered through Gumroad for **$12 USD**. Gumroad may display a localized currency equivalent.

- [Preview real PDF pages](https://nextjs-supabase-checklist-preview.vercel.app/?utm_source=github_resource_md&utm_medium=referral&utm_campaign=launch_checklist)
- [Review the full checklist and run the free 7-check quick review](https://cekuu35.github.io/nextjs-supabase-launch-checklist/?utm_source=github_resource_md&utm_medium=referral&utm_campaign=launch_checklist)
- [Open the $12 product on Gumroad](https://cengokurtoglu.gumroad.com/l/xjnmxt?utm_source=github_resource_md&utm_medium=referral&utm_campaign=launch_checklist)

Written by [Cenk Kurtoğlu](https://github.com/cekuu35).
