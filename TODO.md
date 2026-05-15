# Olive Invoices - Finalization & Deployment TODOs

This file tracks the remaining steps required to fully activate the Stripe integration and deploy the application to production.

## 1. Stripe Dashboard Configuration (Manual)
- [ ] **Create Product:** Create a new Product in the Stripe Dashboard (e.g., "Olive Invoices Pro").
- [ ] **Create Price:** Add a recurring monthly or annual price to the product.
- [ ] **Configure Customer Portal:**
    - Go to Settings > Billing > Customer Portal.
    - Enable "Allow customers to manage their subscriptions".
    - Enable "Allow customers to cancel subscriptions".
    - Enable "Allow customers to update payment methods".
- [ ] **Set Branding:** Upload the "Olive" logo and set brand colors in the Stripe settings to match the UI.

## 2. Environment Configuration
Update your `appsettings.json` or `appsettings.Development.json` with the keys from your Stripe Dashboard:

- [ ] **SecretKey:** `sk_test_...` (from Developers > API Keys).
- [ ] **PublishableKey:** `pk_test_...` (from Developers > API Keys).
- [ ] **SoloPriceId:** `price_...` (from the $9 Solo price you created).
- [ ] **TeamPriceId:** `price_...` (from the $29 Team price you created).
- [ ] **WebhookSecret:** `whsec_...` (from Developers > Webhooks - see Step 3).

## 3. Webhook Setup
- [ ] **Local Testing:**
    - Install the Stripe CLI.
    - Run: `stripe listen --forward-to localhost:5260/api/webhooks/stripe`.
    - Copy the `whsec_...` secret printed in the terminal to your configuration.
- [ ] **Production Webhook:**
    - Create a new endpoint in Stripe: `https://oliveinvoice.com/api/webhooks/stripe`.
    - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

## 4. Database & Infrastructure
- [ ] **Schema Migration:** Apply the Stripe columns to your production database using the updated `schema.postgres.sql` or by running `dotnet ef database update`.
- [ ] **DNS Records:** Point `oliveinvoice.com` A/AAAA records to your production server IP.
- [ ] **Docker Deployment:** Run `docker-compose up -d --build` on the production server.

## 5. Verification Checklist
- [ ] **Upgrade Flow:** Click "Upgrade to Pro" in the UI and verify you are redirected to Stripe.
- [ ] **Webhook Loop:** Complete a test payment and verify the `SubscriptionStatus` in the `Tenants` table updates to `active`.
- [ ] **Billing Portal:** Verify the "Manage Billing" button opens the Stripe Customer Portal with the correct customer data.
- [ ] **SSL:** Verify that `https://oliveinvoice.com` is served over a valid SSL certificate provided by Caddy.
