# Payments: cards, PayPal and pay on delivery

Customers choose at checkout:

1. **Pay online** (card, Apple Pay, Google Pay, PayPal and other wallets): handled by **Stripe**'s secure page. Card numbers never touch your website.
2. **Pay on delivery / at pickup**: the customer pays the driver or the counter. The order goes straight to the kitchen.

Online orders reach the kitchen **only after Stripe confirms the payment**, so you never cook unpaid food.

## Turn on online payment (about 10 minutes)

1. Create a free account at https://stripe.com and stay in **Test mode** (switch at the top of the dashboard).
2. **Developers → API keys**: copy the **Secret key** (starts with `sk_test_`).
3. In `.env.local` paste it after `STRIPE_SECRET_KEY=` and restart `npm run dev`.
4. **Settings → Payment methods**: switch on the methods you want (cards, Apple Pay, Google Pay, **PayPal**, ...). The website needs no change: whatever you enable appears on the payment page.
   - PayPal and some wallets are only offered in certain countries and need your Stripe account to be approved for them. Stripe shows you what is available for your account.
5. Test it: order something, choose **Pay online**, and use card `4242 4242 4242 4242`, any future date, any CVC, any postal code. You return to the order page and the order appears in **Live orders**.

Useful Stripe test cards: `4000 0000 0000 9995` (declined), `4000 0025 0000 3155` (asks for extra authentication).

## Go live

1. In Stripe finish "Activate account" (business details, bank account).
2. Switch off Test mode, copy the **live** secret key (`sk_live_...`) into your hosting environment variables.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-SITE/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
   - Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
4. Redeploy.

Without the webhook the site still works: the customer's order page asks Stripe directly. The webhook adds safety if a customer closes the browser right after paying.

## Refunds

When you cancel an order that was **paid online**, the dashboard reminds you to refund it:
Stripe dashboard → **Payments** → open the payment → **Refund**. Cash orders need no refund.

## Security notes

- Prices are always recalculated on the server from the database; the browser cannot change them.
- The webhook is verified with Stripe's signature, and the paid amount is compared with the order total.
- Each order has a private tracking link; only a hash is stored.
