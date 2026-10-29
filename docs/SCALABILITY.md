# Scalability notes

Goal: many visitors at once, no waiting.

## Already in place

| Area | What we do | Why it helps |
| --- | --- | --- |
| Home and menu pages | Static pages, refreshed in the background at most once a minute (and immediately when the owner edits the menu). The menu falls back to built-in data if the database is down. | A CDN serves them in milliseconds for 10 or 100,000 visitors; no database query per visit. |
| Cart | Lives in the visitor's browser (localStorage). Nothing is stored on the server until checkout. | Browsing and adding dishes costs the server nothing. |
| Checkout | One database transaction per order; prices recalculated from the database; double-submit protection. | Correct under load, no tampering. |
| Kitchen board | One light JSON request every 4 seconds, only while the tab is visible, only for signed-in staff. | Instant enough for a kitchen, very cheap. |
| Order tracking | Customer page refreshes a small JSON endpoint; rate limited per IP. | Thousands of waiting customers cost almost nothing. |
| Settings | Cached in memory for 15 s; concurrent reads share a single query. Money decisions always read fresh data. | Fewer queries without risking wrong prices. |
| Images | `next/image` with AVIF/WebP and a 1-year cache. Fonts are self-hosted. | Small, cached files; no layout jumps. |
| Database | Connection pool with limits and timeouts (`DB_POOL_MAX`) and indexes on every lookup column. | A traffic spike cannot exhaust the database. |
| Abuse protection | Rate limits on ordering, tracking and owner setup; honeypot field. | Bots cannot overload or spam the kitchen. |
| Headers | Compression, security headers, no `X-Powered-By`. | Smaller responses, safer site. |

## Known limits

- **Rate limiting is per server instance.** With several servers each counts separately. For a strict global limit use a shared store (Upstash Redis); only `src/lib/rate-limit.ts` changes.
- **Kitchen updates use polling (4 s).** That is robust on every host. If you later want sub-second pushes, add a Postgres LISTEN/NOTIFY stream on a host that supports long-lived connections.
- Small hosting/database plans limit connections and CPU. Use a pooled connection string (Neon/Supabase) when you deploy.

## Measure it yourself

```
npm run build
npm run start
npm run loadtest -- http://localhost:3000 1000 100
```

Arguments: address, total requests, requests at the same time. It prints requests per second, median and 95th-percentile times.
For a browser audit: Chrome DevTools, **Lighthouse**, on the production build (`npm run start`, not `npm run dev`).
