# How to test everything, step by step

Keep `npm run dev` running in one terminal and use a second terminal for other commands.
Tick each box. "Expected" tells you what you should see.
If a step fails, write down: which step, what you saw, and the red text in the terminal.

## A. Automatic tests (30 seconds)

```
npm run test
```
Expected: the end says `# fail 0`. They check prices and tax, order status rules, order codes, cart maths, Stripe signature checks, time zones, caching and the SEO data.

```
npm run typecheck
```
Expected: no output (no errors).

## B. Look and feel (components)

Open http://localhost:3000

- [ ] Navbar: logo, Home / Menu / About Us / Gallery / Contact, cart button. Scroll: the bar gets a background.
- [ ] Nav links highlight while you scroll; Menu opens the menu page.
- [ ] Phone view (F12, phone icon): menu button opens/closes the menu, `Esc` closes it.
- [ ] Hero: headline, plate image, three info boxes (Order Online / Pay Your Way / Fresh & Hot), "Order Now" buttons go to `/menu`.
- [ ] Menu carousel on the home page: arrows and swipe work; "Add" puts a dish in the cart.
- [ ] Services, Gallery, Crew, Testimonials fade in as you scroll.
- [ ] Footer: links, social icons, **Owner Login**.
- [ ] No text mentions table reservations anywhere. Searching the page for "reserv" finds nothing.
- [ ] Press `Tab` repeatedly: every button/link shows a visible focus ring.

## C. Ordering as a customer

1. [ ] Open `/menu`. Categories appear as chips at the top; clicking one scrolls to it.
2. [ ] Click **Add** on three different dishes and add one of them twice. The cart badge shows 4.
3. [ ] Open the cart: change quantities with + / −, remove a dish, the total updates.
4. [ ] Press **Checkout**.
5. [ ] Choose **Delivery** and leave the address empty, press Place order: red messages appear.
6. [ ] With a small order (below the minimum) choose delivery: you see how much more to add, or choose pickup.
7. [ ] **Cash order:** fill name, phone, email, address, choose **Pay on delivery**, place the order.
   Expected: you land on the order page with a code like `BB-7K2M9Q` and the status "New / Order received".
8. [ ] Choose **Pickup** and place another cash order: the page talks about pickup, not delivery.
9. [ ] Reload the order page: it still works (private link). Open it in a second tab: it updates by itself when the status changes (Section D).
10. [ ] Close the browser and open `/menu` again: the cart is still there until you check out. After ordering, the cart is empty.

## D. Owner: dashboard access and live orders

1. [ ] Click **Owner Login** in the footer (or open `/owner`). Create your account, then enter your `OWNER_SETUP_CODE` phrase. You reach `/admin`.
2. [ ] Wrong phrase: you see "That setup phrase is not correct." Five wrong tries in a row lock it for 15 minutes.
3. [ ] **Live orders** (`/admin/orders`): press **Turn on sound alerts** once.
4. [ ] Put the website in two windows: window 1 = customer (private window), window 2 = dashboard.
5. [ ] In window 1 place a cash order. Within about 4 seconds window 2 shows:
   - [ ] a chime, a glowing "New" card with the code, customer name, phone, address and **every ordered dish with its quantity**;
   - [ ] the browser tab title shows `(1) New orders`.
6. [ ] Press **Start preparing**, then **Mark ready**, then **Out for delivery**, then **Complete**.
   Expected: the card moves across the columns; the customer's order page follows along (progress steps tick).
7. [ ] Place a pickup order: after **Mark ready** the button says **Complete** (no delivery step).
8. [ ] Place another order and press **Cancel order**: confirm; the customer's page shows "Cancelled" and a cancellation email is printed in the terminal.
9. [ ] The cash badge says "Collect $xx.xx cash"; after completing, the order shows as paid in **Order history**.
10. [ ] Stop `npm run dev`, wait 10 seconds, restart: the board shows a red "Connection lost" bar in the meantime and recovers by itself.

## E. Paying online (needs the Stripe test key, see `docs/PAYMENTS.md`)

- [ ] Without a Stripe key: checkout shows only the cash option (online is hidden or disabled with a reason).
- [ ] With the key: choose **Pay online**, place the order. You are taken to Stripe's page.
- [ ] The Stripe page shows card (and Apple/Google Pay, PayPal if you enabled them in Stripe).
- [ ] Pay with `4242 4242 4242 4242`, any future date and any CVC. You return to the order page: "Payment received".
- [ ] The order appears in **Live orders** with the green **Paid online** badge. Before paying, it did NOT appear.
- [ ] Start another online order and press the browser's Back button on the Stripe page: the order page offers **Try paying again** and **Cancel order**; the kitchen never sees it.
- [ ] Pay with `4000 0000 0000 9995` (declined card): Stripe shows an error, nothing reaches the kitchen.
- [ ] Cancel a paid online order in the dashboard: a yellow note reminds you to refund in Stripe.

## F. Owner: menu, settings, team, history

- [ ] **Menu → Add category** "Shakes". It appears; **Hide** removes it from `/menu`; **Show** brings it back.
- [ ] **Add dish** in "Shakes": name, price `5.50`, description, a photo link starting with `https://`. Save. Open `/menu` (wait up to a minute or refresh): the dish is there and can be ordered.
- [ ] Price `abc` shows "Price must be a number like 11.99."
- [ ] **Mark sold out**: `/menu` shows the dish as sold out; it cannot be added.
- [ ] **Edit** a price, then check checkout uses the new price. An item already in a customer's cart with the old price: checkout shows "Prices changed" and the new total.
- [ ] Tick "Show on the home page" for a dish: it appears in the home carousel.
- [ ] **Delete** a dish: old orders keep their history.
- [ ] Dashboard **Online ordering** switch OFF: `/menu` and checkout show your closed message and ordering is blocked. Switch it ON again.
- [ ] **Settings**: change the delivery fee to `2.50` and tax to `8`: checkout totals change (tax is charged on food, not on the delivery fee). Turn **Delivery** off: checkout only offers pickup.
- [ ] Turn both **Pay online** and **Pay on delivery** off: you get "Keep at least one payment method turned on."
- [ ] **Team**: register a second account in a private window, then add its email in **Team**. That account can open Live orders and Menu, but not Settings or Team (it is sent back to the dashboard).
- [ ] **Order history**: Previous / Today / Next change the day; the total sales number excludes cancelled orders.

## G. Accounts and permissions

- [ ] `/register`: empty form shows messages; a short password is rejected.
- [ ] `/login` with a wrong password: clear error.
- [ ] A normal customer opening `/admin` is sent to `/owner` and sees "No dashboard access".
- [ ] When signed out, `/admin/orders` sends you to `/login`, and after signing in you return there.
- [ ] **Sign out** works.
- [ ] While signed out open `http://localhost:3000/api/admin/orders`: you get `{"error":"Unauthorized"}`.

## H. SEO

Run these on the production build (`npm run build` then `npm run start`).

- [ ] `/sitemap.xml` lists `/` and `/menu`.
- [ ] `/robots.txt` allows `/` and blocks `/admin`, `/api`, `/checkout`, `/order`.
- [ ] Right-click the home page, **View page source**, search for `application/ld+json`: you see a `Restaurant` block with name, phone, address, opening hours and menu link.
- [ ] Paste your live address into https://search.google.com/test/rich-results: "Restaurant" is detected.
- [ ] The page source `<title>` is "Breaking Buns | Burgers & Buns Delivered Hot", `/menu` shows "Menu | Breaking Buns", and each has a description and Open Graph tags (`og:title`, `og:description`).
- [ ] Pages that must stay private (`/checkout`, `/order/...`, `/admin`) contain `noindex`.
- [ ] `/manifest.webmanifest` loads; on a phone, Chrome offers **Add to Home Screen**.
- [ ] Chrome DevTools, **Lighthouse**, SEO category: 95 or higher.
- [ ] Every image has a description (Lighthouse "Accessibility" has no "image alt" error).
- [ ] An unknown address like `/nope` shows the friendly "off the menu" page.

## I. Speed and scalability

```
npm run build
npm run start
npm run loadtest -- http://localhost:3000 1000 100
```
- [ ] `Failures: 0`.
- [ ] `95th pct` below 300 ms on a normal laptop.
- [ ] Lighthouse (mobile): Performance 90+, Accessibility 95+, Best practices 95+.
- [ ] Network tab: images are `webp`/`avif`; fonts come from your own site.
- [ ] Place 12 orders in a row from one browser quickly: after 10 you get "Too many attempts" (rate limit); the kitchen board stays responsive meanwhile.

## J. Security quick checks

- [ ] `/order/not-a-real-token-123456` shows the friendly 404, no error trace.
- [ ] Response headers include `x-content-type-options: nosniff` and no `x-powered-by`.
- [ ] In DevTools, edit a price in the cart storage (Application, Local Storage, `breaking-buns-cart-v1`) to `1` and check out: the server uses the real database price (you see "Prices changed" or the true total).
- [ ] A staff member cannot open `/admin/settings` (sent back to the dashboard).
