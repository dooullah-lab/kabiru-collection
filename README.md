# Kabiru Collection — Setup Guide

This explains every step, in plain language, to get your real store live on
the internet. Do the steps in order. Nothing here needs you to know how to
code — just follow along and copy/paste where shown.

Think of it like building a shop: first you build a shelf (the database),
then a cash register (payments), then you put the shop on a real street
(hosting), then you give it an address (domain).

---

## Step 1 — Create your database (Supabase)

This is where your products live — like a filing cabinet in the cloud.

1. Go to https://supabase.com and click "Start your project". Sign up (free).
2. Click "New Project". Give it a name like `kabiru-collection`, set a
   database password (save it somewhere), pick a region close to Nigeria
   (e.g. "West EU" or the closest available), and click Create.
3. Once it's ready, click "SQL Editor" in the left sidebar, then "New query".
4. Open the file `supabase/schema.sql` from this project, copy everything
   inside it, paste it into the query box, and click "Run".
   This creates your `products` shelf and `orders` shelf.
5. Click "Project Settings" (gear icon) → "API". You'll see three things
   you need later:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (keep this one extra private)

---

## Step 2 — Create your payment account (Paystack)

This is your cash register — it's what lets customers actually pay you.

1. Go to https://paystack.com and click "Create free account". Sign up
   with your business details.
2. Once logged in, go to Settings → API Keys & Webhooks.
3. You'll see a **Test Secret Key** and **Test Public Key** — use these
   while you're setting things up (no real money moves with test keys).
4. When you're ready to accept real payments, Paystack will ask you to
   verify your business (BVN, bank account) to switch to **Live** keys.
5. Leave this tab open — you'll paste a "Webhook URL" here after Step 4.

---

## Step 3 — Put the code on GitHub

GitHub is just a shelf for your code, and it's how the hosting service
(Vercel, next step) gets a copy of your site.

1. Go to https://github.com and create a free account if you don't have one.
2. Click the "+" icon → "New repository". Name it `kabiru-collection`,
   keep it Private, click Create.
3. On your own computer, open a terminal inside this project folder and run:
   ```
   git init
   git add .
   git commit -m "First version of Kabiru Collection"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/kabiru-collection.git
   git push -u origin main
   ```
   (Replace YOUR-USERNAME with your actual GitHub username.)

---

## Step 4 — Put your store on the internet (Vercel)

Vercel is the "street" your shop will stand on — it hosts the site and
gives you a live web address.

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click "Add New" → "Project", then pick your `kabiru-collection` repo.
3. Before clicking Deploy, open "Environment Variables" and add these
   (using the values you saved in Steps 1 and 2):

   | Name | Value |
   |---|---|
   | NEXT_PUBLIC_SUPABASE_URL | your Supabase Project URL |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | your Supabase anon public key |
   | SUPABASE_SERVICE_ROLE_KEY | your Supabase service role key |
   | PAYSTACK_SECRET_KEY | your Paystack test secret key |
   | NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY | your Paystack test public key |
   | ADMIN_PASSWORD | a password you make up, for reaching /admin |
   | NEXT_PUBLIC_SITE_URL | leave blank for now, you'll fill this after deploying |

4. Click "Deploy". Wait a minute or two — Vercel will build your site.
5. When it's done, you'll get a real web address like
   `kabiru-collection.vercel.app`. Copy it.
6. Go back to Vercel → your project → Settings → Environment Variables,
   and set `NEXT_PUBLIC_SITE_URL` to that address (with `https://` in front).
   Redeploy (Deployments tab → "..." on the latest one → Redeploy).

Your store is now live! Visit the address to see it.

---

## Step 5 — Connect the webhook (so payments actually get marked as paid)

1. Back in your Paystack dashboard (Settings → API Keys & Webhooks),
   find "Webhook URL" and paste:
   `https://YOUR-SITE-ADDRESS/api/paystack-webhook`
2. Click Save.

This is the piece that tells your database "this order has been paid for"
the moment a customer completes payment.

---

## Step 6 — Add your products

1. Visit `https://YOUR-SITE-ADDRESS/admin`
2. Enter the ADMIN_PASSWORD you set in Step 4.
3. Fill in the form and click "Add product". It appears on your shop
   instantly.

---

## Step 7 — Get a proper domain (optional but recommended)

Instead of `kabiru-collection.vercel.app`, you can use something like
`kabirucollection.com`:

1. Buy a domain from a registrar (e.g. Namecheap, or a Nigerian registrar
   like WhoGoHost).
2. In Vercel, go to your project → Settings → Domains → add your domain.
3. Vercel will show you 1–2 DNS records to add at your domain registrar.
   Add them there, wait ~10–30 minutes, and your domain will point to
   your store.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your new domain, and update
   the webhook URL in Paystack to match too.

---

## Step 8 — Go live for real

While testing, you were using Paystack's **Test** keys — no real money
moves. When you're ready:

1. Complete Paystack's business verification (in their dashboard).
2. Switch `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in
   Vercel to your **Live** keys.
3. Redeploy.

Now real customers can really pay you.

---

## A few honest notes

- The admin password is simple on purpose — good enough for one person
  running their own store, but if you ever add staff, consider upgrading
  to proper accounts (Supabase Auth handles this well).
- Test everything with a small ₦100 test payment before telling customers
  the store is open.
- Keep your `service_role` key and `PAYSTACK_SECRET_KEY` secret — never
  put them in code that gets shown in the browser. This project already
  keeps them server-side only.
