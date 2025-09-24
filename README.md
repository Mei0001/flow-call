This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Pages

This project is configured for Cloudflare Pages using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages).

1. Ensure your API routes that run server-side code opt into the Edge runtime. (Example: `src/app/api/generate-script/route.ts` now exports `runtime = "edge"`.)
2. Build locally with `npm run cf:build`. _Note_: Running this command outside Cloudflare's CI requires a `.vercel/project.json` (created via `vercel link`/`vercel pull`) or exported `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` values so that `vercel build` can determine project settings. Cloudflare's build environment supplies these automatically.
3. Preview locally with `npm run cf:preview` once the build output exists.
4. Deploy via:
   - **Git integration**: Set _Framework preset_ to **Next.js**, _Build command_ to `npx @cloudflare/next-on-pages@1`, and _Build output directory_ to `.vercel/output/static`. Add the `nodejs_compat` compatibility flag for production and preview under _Settings → Functions_. Provide required environment variables (for example `OPENAI_API_KEY`) under _Settings → Environment variables_.
   - **Direct upload**: Set `CLOUDFLARE_PAGES_PROJECT=<project-name>` and run `npm run cf:deploy`.

If you prefer Vercel, follow the standard [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
