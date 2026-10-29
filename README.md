# Breaking Buns

Online ordering platform for a burger restaurant: customers order several dishes at once and pay online (card, Apple/Google Pay, PayPal via Stripe) or on delivery. The owner sees every order live in a dashboard.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, PostgreSQL + Drizzle ORM and Better Auth.

## Quick start

See **docs/GETTING-STARTED.md** (written for non-developers). Short version:

```
npm install
cp .env.example .env.local   # fill BETTER_AUTH_SECRET and OWNER_SETUP_CODE
npm run setup                # database + starter menu
npm run dev
```

Then open `/owner`, create your account, type your `OWNER_SETUP_CODE`: you are the owner and can open `/admin`.

## Documentation

- `docs/GETTING-STARTED.md` run it, become the owner, go online
- `docs/TESTING.md` step-by-step test checklist (components, ordering, payments, dashboard, SEO, speed, security)
- `docs/PAYMENTS.md` Stripe, PayPal and pay-on-delivery
- `docs/SCALABILITY.md` how it stays fast under load
- `docs/tailwind-guidelines.md` class rules used in this codebase

## Structure

- `src/app/(site)` public pages: home, menu, checkout, order tracking
- `src/app/(auth)` login, register, owner setup
- `src/app/admin` dashboard: live orders, history, menu, settings (owner), team (owner)
- `src/app/api` order tracking, live orders feed (staff only), Stripe webhook
- `src/app/actions` server actions (place order, status changes, menu, settings, team)
- `src/lib/orders` pricing, status rules, order placement (pure parts are unit-tested)
- `src/lib/payments` Stripe client and webhook signature check (no SDK)
- `src/db` Drizzle schema (`shop.ts`, `auth.ts`) and queries
- `src/components` `ui`, `modules` (home sections), `cart`, `checkout`, `order`, `admin`, `shared`

## Security notes

- `proxy.ts` only checks that a session cookie exists. Real authorization runs on the server with `requireStaff()` / `requireOwner()` in every admin page, route handler and action.
- Prices are recalculated on the server; online orders only reach the kitchen after Stripe confirms payment.
- Orders are tracked through a private link; only a hash of the token is stored.
