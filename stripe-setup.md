# Stripe Setup — Olive Invoice

## 1. Create Products and Prices

Go to **Stripe Dashboard → Product catalogue → Add product**.

**Solo product:**
- Name: `Solo`
- Pricing model: Standard pricing
- Price: `$9.00` / month (recurring)
- Currency: USD
- Copy the **Price ID** — looks like `price_1ABC...`

**Team product:**
- Name: `Team`
- Same as above but `$29.00` / month
- Copy the **Price ID**

Update `.env` with the real price IDs:
```
STRIPE_SOLO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_TEAM_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Fix the Webhook Secret Whitespace Bug

The current `.env` has a leading space after `=` on the webhook secret line:
```
STRIPE_WEBHOOK_SECRET= whsec_edad...   ← space here causes every webhook to return 400
```

Remove it:
```
STRIPE_WEBHOOK_SECRET=whsec_edad1dbbc4e5f36665cc7ce9cc7402f0156a7211f43c1484baf8e27eab7f1a23
```

---

## 3. Register the Webhook Endpoint

Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**.

- **Endpoint URL:** `https://oliveinvoice.com/api/webhooks/stripe`
- **Listen to:** Select these four events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

After saving, click the endpoint and reveal the **Signing secret** (`whsec_...`). Update `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_yournewsecret
```

> Each environment (production, local) needs its own webhook endpoint with its own signing secret — they are not interchangeable.

---

## 4. Configure the Customer Portal

The billing portal (`/api/billing/portal`) lets users manage their subscription — cancel, update their card, download invoices. It won't work until configured in Stripe.

Go to **Stripe Dashboard → Settings → Billing → Customer portal** and enable:

- ✅ Allow customers to cancel subscriptions
- ✅ Allow customers to update payment methods
- ✅ Allow customers to view invoice history
- Set **Business information** → name: `Olive Invoice`
- Set **Return URL:** `https://oliveinvoice.com`

Save the configuration.

---

## 5. Test Locally with the Stripe CLI

Stripe cannot reach `localhost` directly, so use the CLI to forward events.

```bash
# Install (Mac)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local API
stripe listen --forward-to http://localhost:5260/api/webhooks/stripe
```

The CLI prints a **local** signing secret (`whsec_...`). Use that in `.env` while testing locally — **not** the production one. Switch back to the production secret before deploying.

**Trigger test events:**
```bash
# Simulate a successful subscription
stripe trigger checkout.session.completed

# Simulate a failed payment
stripe trigger invoice.payment_failed

# Simulate cancellation
stripe trigger customer.subscription.deleted
```

---

## 6. End-to-End Checkout Flow

The frontend calls `POST /api/billing/checkout` with `{ tier, successUrl, cancelUrl }`. Verify it is passing the correct redirect URLs:

```ts
billingApi.createCheckoutSession(
  'Solo',
  'https://oliveinvoice.com?checkout=success',   // Stripe redirects here after payment
  'https://oliveinvoice.com?checkout=canceled'   // Stripe redirects here if user cancels
)
```

The `tier` value must be exactly `"Solo"` or `"Team"` — casing matters as it is stored in the database and compared directly.

After Stripe redirects back to `successUrl`, the tier won't update in the UI until the user logs out and back in. Consider adding a `?checkout=success` handler that refreshes the auth context once everything else is working.

---

## 7. .env Checklist

```
STRIPE_SECRET_KEY=sk_live_...           # Dashboard → Developers → API keys
STRIPE_PUBLISHABLE_KEY=pk_live_...      # Same page (used if you add Stripe.js to the frontend)
STRIPE_SOLO_PRICE_ID=price_...          # From the Solo product created in step 1
STRIPE_TEAM_PRICE_ID=price_...          # From the Team product created in step 1
STRIPE_WEBHOOK_SECRET=whsec_...         # From the webhook endpoint — no leading space
```

The `docker-compose.yml` maps these to the ASP.NET configuration keys the code expects
(`Stripe__SecretKey` → `Stripe:SecretKey`, etc.) — that wiring is already in place.

---

## Subscription Status Reference

| Stripe Status | Meaning | App behaviour |
|---|---|---|
| `active` | Paying, all good | Full access for their tier |
| `past_due` | Payment failed, Stripe retrying | Full access maintained during retry window |
| `canceled` | Canceled or retries exhausted | Downgraded to Free tier |
| `unpaid` | All retries failed, not yet deleted | Downgraded to Free tier |
| `trialing` | In trial period | Full access for their tier |
