# Release Challenger

AI-assisted release readiness review for intent, evidence, blast radius, and recovery.

## Local development

```bash
npm install
npm run dev
```

The app works without an API key by returning the built-in example review. To use live OpenAI analysis, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. The key is read only by `app/api/challenge/route.ts` and is never sent to the browser.

## Vercel deployment

Import this repository into Vercel, then add these Project Settings → Environment Variables for the environments you want to use:

- `OPENAI_API_KEY` — required for live AI reviews
- `OPENAI_MODEL` — optional; defaults to `gpt-4.1-mini`

Redeploy after adding or changing environment variables. No database, authentication, or persistent storage is required.

The repository includes `vercel.json` so Vercel treats the project as a Next.js app and uses the `.next` build output rather than looking for a static `public` directory.

## Evaluation

Both example buttons populate release-plan input only. The user must click “Challenge this release”, and both scenarios use the same live `/api/challenge` endpoint, model configuration, system prompt, and structured-output validation.

- **Ready example — Support Portal Guidance Copy Update:** `CONDITIONAL_GO / HIGH confidence / LOW risk`. The review recognized the narrow, reversible copy-only change and asked only for proportionate confirmation of the production flag, artifact, and internal-account rollout.
- **Risky example — Legacy Asset Management App Cleanup:** `NO_GO / HIGH confidence / HIGH risk`. The review surfaced unverified target identity, separately generated population provenance, unproven canary equivalence, and unproven recovery readiness.

No expected decision is hardcoded for either example, and no system-prompt changes were made for these scenarios.
