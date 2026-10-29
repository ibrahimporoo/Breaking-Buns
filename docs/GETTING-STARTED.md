# Getting started: run Breaking Buns on your computer

No developer experience needed. Copy each command exactly.
A **terminal** is the text window where you type commands
(Windows: search "PowerShell". Mac: search "Terminal").

## 1. Install three free programs (one time)

1. **Node.js 22 LTS**: https://nodejs.org (click the LTS button, then Next until it finishes).
2. **Docker Desktop**: https://www.docker.com/products/docker-desktop (it runs the database for you). Open it once and wait until it says it is running.
3. **VS Code** (free editor, to edit one settings file): https://code.visualstudio.com

Check it worked. Each command must print a version number:

```
node --version
docker --version
```

## 2. Open the project folder

Unzip `breaking-buns-v0.4.zip`. In the terminal type `cd ` (with a space), drag the unzipped
`breaking-buns` folder into the terminal window, and press Enter.

## 3. Install the project parts

```
npm install
```

Takes a few minutes the first time.

## 4. Create your settings file

- Mac / Linux: `cp .env.example .env.local`
- Windows PowerShell: `copy .env.example .env.local`

Open `.env.local` in VS Code and fill in **two** values:

1. `BETTER_AUTH_SECRET`: a long random text.
   - Mac / Linux: run `openssl rand -base64 32` and paste the result.
   - Windows PowerShell: run `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))` and paste the result.
2. `OWNER_SETUP_CODE`: a secret phrase **only you know**, at least 12 characters, for example `my-burger-secret-2026`. You will type it once to become the owner.

Leave everything else as it is. (Stripe/online payment is optional: see `docs/PAYMENTS.md`.)

## 5. Start the database and add the starter menu
```
1- npm run db:push
```
It uses drizzle-kit push to instantly synchronize your local PostgreSQL database state with your current TypeScript code models without creating a permanent migration file.

```
2- npm run setup
```

## 6. Start the website

```
npm run dev
```

Open http://localhost:3000. To stop the website press `Ctrl + C`.

## 7. Open your owner dashboard (3 clicks, once)

1. Open http://localhost:3000/owner (there is also an **Owner Login** link at the bottom of every page).
2. Click **Create account**, enter your name, email and a password.
3. You land on the "Set up your restaurant" page. Type your `OWNER_SETUP_CODE` phrase and press **Become the owner**.

You are in the dashboard. Next time: open `/owner`, sign in, done. To add staff, use **Team** in the dashboard.

## What you can do in the dashboard

| Page | What it is for |
| --- | --- |
| Dashboard | Today's orders and sales, and the big **Online ordering ON/OFF** switch |
| Live orders | New orders appear within seconds with a sound alert. Press the buttons to move each order: Start preparing, Mark ready, Out for delivery, Complete |
| Order history | Every past day, with totals |
| Menu | Add or edit dishes, prices, photos, mark sold out, hide categories |
| Settings (owner) | Delivery on/off, pickup on/off, pay online / pay on delivery, fees, minimum order, tax |
| Team (owner) | Give your staff access |

**Tip:** open **Live orders** on a tablet or the kitchen computer and press **Turn on sound alerts** once.

## Emails

Without an email provider, emails are printed in the terminal where `npm run dev` runs. That is fine
for testing. For real emails create a free account at https://resend.com, put the key in `RESEND_API_KEY`,
and set `OWNER_EMAIL` to the address that should receive "new order" emails. Restart the website afterwards.

## Every day after that

```
npm run db:up      # only if Docker was restarted
npm run dev
```

## Putting the website online (summary)

1. Create a hosted PostgreSQL database (Neon, Supabase, Railway) and put its URL in `DATABASE_URL`.
2. Deploy on Vercel (or another Node host), add every value from `.env.local` as environment variables, and set `BETTER_AUTH_URL` to your real address (for example `https://breakingbuns.com`).
3. Run `npm run db:push` and `npm run db:seed` once against the hosted database.
4. Open `https://your-site/owner` and create the owner account (same 3 clicks).
5. Set up the Stripe webhook (see `docs/PAYMENTS.md`).

## Common problems

| Problem | Fix |
| --- | --- |
| `docker: command not found` | Open Docker Desktop and wait until it is running. |
| `Invalid environment variables` | `.env.local` is missing or a required value is empty (step 4). |
| Menu page shows items but ordering fails | Database not started or not seeded: run `npm run setup`. |
| "Owner setup is switched off" | Put a phrase of 12+ characters in `OWNER_SETUP_CODE`, restart `npm run dev`. |
| "Online payment unavailable" | Stripe key missing: see `docs/PAYMENTS.md`. Cash still works. |
| Port 3000 already in use | `npm run dev -- -p 3001` |
| Port 5432 already in use | Stop the other PostgreSQL, then `npm run db:up`. |
