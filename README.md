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
