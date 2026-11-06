# MoHoLocal delivery runbook

Updated November 5, 2026. Existing stack: Next.js, Supabase and Cloudflare Workers. Primary site: https://www.moholocal.com.

Both existing Workers connect to `dsovan2004-beep/moho-app`, production branch `main`, root `/`. Cloudflare installs the lockfile dependencies in a clean build environment using Node 22. Preview builds are disabled. The obsolete `moho-app` Pages production and preview automatic builds are disabled.

| Worker | Build | Deploy |
|---|---|---|
| moho-web | `npm run typecheck && npm run cf:build` | `npx wrangler deploy` |
| moho-ingestion | `npx tsc --noEmit -p workers/tsconfig.json` | `npx wrangler deploy --config workers/wrangler.toml` |

Web build variables: Node version, Cloudflare account ID, telemetry opt-out, public Supabase URL and modern publishable key. The ingestion server key is an encrypted runtime secret, never a build variable. Secret values do not belong in source, documentation, issue bodies or build logs.

The dedicated deployment token retains the original four approved permissions: account Workers Scripts Edit and Account Settings Read, plus Zone Read and Workers Routes Edit for moholocal.com. It expires November 5, 2027. Temporary Workers Builds Configuration Edit was removed after connection; its absence was verified with HTTP 403 on the build-token registry and successful subsequent deployments. Build configuration changes use the owner's Cloudflare dashboard; do not broaden the runtime deployment token to make configuration API reads succeed.

Watch paths route application/configuration changes to the web build and worker/configuration changes to ingestion. Documentation-only changes are excluded. GitHub check runs named `Workers Builds: moho-web` and `Workers Builds: moho-ingestion` provide the source commit, result and dashboard build URL. Ingestion's custom-config deployment may appear separately as Wrangler in the Worker version list; correlate the successful build log and deployment time rather than relying on that UI label alone.

Before considering delivery complete, verify the successful commit check, active runtime version, live pages and a representative interaction. For a rollback, choose a previously known-good Worker deployment in Cloudflare, then correct main through the normal source workflow. Do not re-enable the unsupported Pages build or disable database RLS. Listing corrections have private previous/applied values and source evidence; review that audit before any data reversal.

Credential retirement and build evidence: deployment-evidence.json, native-builds-reduced-permissions-2026-11-05.json, runtime-deployments-2026-11-05.json and credential-retirement-complete-2026-11-05.json. Remaining product and supply work is tracked in ../BACKLOG.md, ../ROADMAP.md and ../SPRINTS.md.
