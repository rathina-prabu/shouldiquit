# Deploying shouldiquit.work to Vercel

## Live state

- **GitHub repo:** https://github.com/rathinaprabu/shouldiquit (private)
- **Vercel project:** `rathinaprabu-4745s-projects/shouldiquit`
- **Production env vars set on Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL` ✓
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
  - `SUPABASE_URL` ✓
  - `SUPABASE_SERVICE_ROLE_KEY` ✓ (using the publishable key — permissive RLS lets it work)
  - `ANTHROPIC_API_KEY` ⏸️ not yet set — templated fallback fires until you add the real key

## What's left (you)

1. Wait for the current `vercel --prod` to finish — should land at `https://shouldiquit-*.vercel.app`
2. Walk the prod URL on your phone to confirm everything works
3. Attach the domain (see "Domain" below)
4. When the Anthropic org is restored, add `ANTHROPIC_API_KEY` via `vercel env add` and redeploy

## What you do (one-time)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Log in to Vercel

```bash
vercel login
```
Opens a browser to authenticate. Use the email you want billed (most likely your personal one).

### 3. Link this repo to a Vercel project

From the project root:
```bash
cd /Users/rathinaprabhu/SCG/shouldiquit
vercel link
```
Answer prompts:
- "Set up and link?" → **Y**
- "Which scope?" → your personal account
- "Link to existing project?" → **N**
- "Project name?" → **shouldiquit** (or whatever)
- "In which directory is your code?" → **.** (just press Enter)
- "Want to override settings?" → **N** (Next.js auto-detected)

### 4. Push the env vars to Vercel

Run each, paste the value when prompted, and choose "Production, Preview, Development" for all:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# paste: https://yojxqkwqlnodtllkmauq.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# paste: sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq

vercel env add SUPABASE_URL
# paste: https://yojxqkwqlnodtllkmauq.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# paste: sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq
# (using the publishable key is fine — permissive RLS lets it write)

vercel env add ANTHROPIC_API_KEY
# paste your real Anthropic API key (or leave blank — templated fallback kicks in)
```

### 5. Deploy

```bash
vercel --prod
```
Takes ~60–90 seconds. At the end it prints a URL like `https://shouldiquit-abc123.vercel.app`. Open it on your phone — everything should work.

### 6. Attach the shouldiquit.work domain

```bash
vercel domains add shouldiquit.work
```
Vercel prints DNS records to add at your registrar (the `A` record + sometimes a `CNAME` for `www`). Two paths:

- **If your registrar supports it** (Cloudflare, Namecheap, Porkbun, etc.): add an `A` record pointing to `76.76.21.21` and a `CNAME` for `www` pointing to `cname.vercel-dns.com`.
- **Easier path: use Vercel's nameservers.** Vercel may suggest changing your domain's nameservers to `ns1.vercel-dns.com` + `ns2.vercel-dns.com`. Apply that at your registrar — propagates faster than per-record changes (~5 min vs. 1-24 hours).

After DNS propagates, https://shouldiquit.work loads automatically with a free auto-renewing TLS cert.

### 7. Smoke test on production

On your phone:
- Open https://shouldiquit.work — landing should load with the live taker count
- Run through a quiz end-to-end
- On the result page, tap the WhatsApp / X / LinkedIn / native share buttons — the verdict image preview should now render
- Share the URL with yourself, open it in an incognito tab — should see the visitor view, not your verdict

If anything's off, check `vercel logs --prod` for runtime errors.

## What you can ignore for v1
- **CI**: no GitHub Actions wired up. Push to main → no auto-deploy unless you connect the Git integration on Vercel's project dashboard (recommended: do it).
- **Custom OG image for the landing page** (the home page itself has no OG image — only the verdict cards do). Easy add later.
- **Plausible / analytics**: not set up. Add when you're ready.

## Future deploys

After the first manual `vercel --prod`, connect the Git integration on Vercel:
- Vercel dashboard → project → Settings → Git → Connect Repository
- Pick the `shouldiquit` repo on GitHub
- Every push to `main` triggers a deploy automatically. PRs get preview URLs.

## Rolling back

If a deploy is broken:
```bash
vercel ls                            # list recent deployments
vercel promote <previous-deploy-url> # promote a previous one to production
```
