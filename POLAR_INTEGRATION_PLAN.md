# Polar + Stripe Integration Plan for AbyssNotes

## Current Status

**AgentCompiler:** Already uses Polar + Stripe for payments
- Polar checkout implemented in `/api/v1/polar/checkout`
- Products configured (FREE, PRO, ENTERPRISE)
- Webhooks handling in `/success` route
- Authentication via Polar for paid tiers

**Mission Control HQ:** Uses Polar + Stripe
- Same tech stack (proven model)
- Subscription-based pricing
- Billing generator, invoices
- Multi-tier plans

## AbyssNotes Implementation Plan

### Phase 1: Polar Setup (1 day)

**Prerequisites:**
- [ ] Polar account (Leviath, you need to create this)
- [ ] Stripe account (Leviath, you need to create this)
- [ ] Polar product configuration

**Polar Products to Create:**

1. **AbyssNotes Free** ($0)
   - Features: All current features
   - Limitations: Basic themes only
   - License key required: No

2. **AbyssNotes Pro Monthly** ($9/mo)
   - Features: All themes, advanced graph, kanban power features
   - License key required: Yes
   - Limitations: None

3. **AbyssNotes Pro Annual** ($79/year)
   - Features: Same as Pro Monthly
   - License key required: Yes
   - Savings: 2 months free

4. **AbyssNotes Team (5 users)** ($29/mo or $249/year)
   - Features: All Pro features + team sync
   - License key required: Yes (per team)
   - Multi-seat management

5. **AbyssNotes Lifetime** ($149 one-time)
   - Features: All Pro features
   - License key required: Yes
   - Updates: Lifetime

### Phase 2: Backend Integration (2-3 days)

**New Endpoints:**

```javascript
// GET /api/polar/products
// Fetch all Polar products
// Returns: tiers, prices, benefits

// POST /api/polar/checkout
// Start Polar checkout session
// Body: { productId, successUrl, cancelUrl }
// Returns: { checkoutUrl }

// GET /api/polar/success
// Handle Polar success callback
// Query: { session_id, product_id }
// Returns: License key

// POST /api/license/verify
// Verify license key validity
// Body: { licenseKey }
// Returns: { valid, tier, features, expiry }

// GET /api/license
// Get current license info
// Requires: License key in header or stored locally
// Returns: { tier, features, expiry }
```

**Database Schema Update:**

```prisma
model License {
  id        String   @id @default(cuid())
  userId    String?  // If we add auth later
  licenseKey String  @unique
  tier      String   // FREE, PRO_MONTHLY, PRO_ANNUAL, TEAM, LIFETIME
  features  Json     // { themeEngine: true, advancedGraph: true, teamSync: true }
  expiry    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Phase 3: Frontend Integration (2-3 days)

**New UI Components:**

1. **License Modal**
   - Shows when Pro feature clicked without license
   - "Upgrade to Pro" button
   - Links to Polar checkout

2. **Pricing Page**
   - Product comparison table
   - Feature breakdown by tier
   - "Choose Plan" buttons → Polar checkout

3. **License Dashboard**
   - View current license
   - Renew subscription
   - Manage team seats
   - Download invoices (via Polar)

### Phase 4: Testing (1 day)

**Test Checklist:**
- [ ] Free tier works without license
- [ ] Pro features locked without license
- [ ] Polar checkout redirects correctly
- [ ] Successful payment generates valid license key
- [ ] License verification endpoint works
- [ ] Expired licenses correctly rejected
- [ ] Team licenses allow multi-seat access
- [ ] Subscription renewal flow works

### Phase 5: Launch (1 day)

**Launch Tasks:**
- [ ] Create Polar products (in Polar dashboard)
- [ ] Configure Stripe webhooks (in Stripe dashboard)
- [ ] Set environment variables (POLAR_API_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Deploy to production
- [ ] Test end-to-end with real payment ($1 test)

## Pricing Strategy (Refined Based on Competition)

### Tiers

| Tier | Price | Features | Best For |
|-------|--------|----------|-----------|
| **Free** | $0 | Basic features, 3 themes | Users testing product |
| **Pro Monthly** | $9/mo | All themes, advanced graph, kanban power, mission export | Individuals |
| **Pro Annual** | $79/year ($6.58/mo) | Same as Monthly, 2 months free | Committed users |
| **Team (5 seats)** | $29/mo or $249/year | All Pro + team sync, shared kanban | Small teams |
| **Lifetime** | $149 one-time | All Pro forever | Lifetime value seekers |

**Strategy:**
- Free: Get users in the door
- Pro Monthly: Default option ($9 is lower than Mission Control's likely price)
- Pro Annual: Anchor at $79 (psychological threshold under $100)
- Team: Higher margin, multi-seat value
- Lifetime: Alternative for subscription-haters (one big number vs many small ones)

### Competitive Messaging

**Vs Mission Control:**
```
Mission Control HQ:
❌ Requires account/cloud
❌ Monthly subscription ($9-20/mo for teams)
❌ Not open source
❌ No graph view
❌ Proprietary SaaS

AbyssNotes:
✅ 100% local, no account
✅ One-time purchase option ($149 lifetime)
✅ MIT open source
✅ Graph visualization (D3.js)
✅ Founder-focused, not enterprise

Same power, your data stays yours.
```

**Vs Obsidian:**
```
Obsidian:
❌ No built-in kanban
❌ No mission control
❌ No founder-focused features
❌ Requires plugins for everything
❌ Community plugins = security risk

AbyssNotes:
✅ Kanban built-in
✅ Mission control dashboard
✅ Founder metrics
✅ Everything in one tool
✅ Open source, auditable
✅ Local-first (privacy)

Obsidian notes + tasks + mission, one tool.
```

## Technical Implementation Notes

### Polar SDK Usage

```bash
npm install @polar-sh/sdk
```

```javascript
import { Polar } from '@polar-sh/sdk';

const polar = new Polar({
  accessToken: process.env.POLAR_API_KEY,
  server: 'production'
});

// Get products
const products = await polar.products.list();

// Create checkout session
const checkout = await polar.checkouts.create({
  productId: 'pro_monthly',
  successUrl: 'https://abyssnotes.com/success',
  cancelUrl: 'https://abyssnotes.com/pricing'
});
```

### Stripe Webhook Handler

```javascript
app.post('/webhooks/polar', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['polar-signature'];
  const event = polar.webhooks.constructEvent(req.body, signature);

  if (event.type === 'checkout.session.completed') {
    const { productId, userId } = event.data;
    const licenseKey = generateLicenseKey(productId, userId);

    await prisma.license.create({
      licenseKey,
      tier: productId,
      userId,
      expiry: calculateExpiry(productId)
    });

    // Send email with license key
    await sendLicenseEmail(userId, licenseKey);
  }

  res.json({ received: true });
});
```

### License Key Generation

```javascript
function generateLicenseKey(tier, userId) {
  const prefix = 'ABYSS-';
  const tierCode = {
    FREE: 'FREE',
    PRO_MONTHLY: 'PRO1M',
    PRO_ANNUAL: 'PRO1Y',
    TEAM: 'TEAM5',
    LIFETIME: 'LIFE'
  }[tier];

  const random = crypto.randomBytes(16).toString('hex').toUpperCase();
  const checksum = crypto.createHash('sha256')
    .update(prefix + tierCode + random)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();

  return `${prefix}${tierCode}-${random}-${checksum}`;
}

function verifyLicenseKey(licenseKey) {
  const parts = licenseKey.split('-');
  if (parts.length !== 3) return false;

  const [prefix, tierCode, random, checksum] = parts;
  const expectedChecksum = crypto.createHash('sha256')
    .update(prefix + tierCode + random)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();

  return checksum === expectedChecksum;
}
```

## Revenue Projections (With Payments)

### Conservative (First 3 months)
- Free users: 500
- Pro Monthly: 20 @ $9 = $180/mo
- Pro Annual: 10 @ $79 = $79/mo
- Lifetime: 5 @ $149 = $25/mo (amortized)
- **Total:** ~$284/mo → ~$850 first 3 months

### Realistic (6 months in)
- Free users: 1,000
- Pro Monthly: 50 @ $9 = $450/mo
- Pro Annual: 30 @ $79 = $198/mo
- Team: 5 @ $29 = $145/mo
- Lifetime: 15 @ $149 = $74/mo (amortized)
- **Total:** ~$867/mo → ~$5,200 first 6 months

### Optimistic (1 year in)
- Free users: 2,000
- Pro Monthly: 100 @ $9 = $900/mo
- Pro Annual: 50 @ $79 = $330/mo
- Team: 15 @ $29 = $435/mo
- Lifetime: 30 @ $149 = $148/mo (amortized)
- **Total:** ~$1,813/mo → ~$21,750/year

## Next Actions (For Leviath)

### You Must Do (Payment Setup):
1. [ ] Create Polar account: https://polar.sh/
2. [ ] Connect Stripe to Polar
3. [ ] Add bank account for payouts
4. [ ] Create AbyssNotes products (5 tiers) in Polar dashboard
5. [ ] Get API keys (Polar + Stripe webhook secret)
6. [ ] Share credentials with me (store in environment variables)

### I Can Do (Implementation):
1. [ ] Implement Polar SDK integration
2. [ ] Add license verification system
3. [ ] Create checkout endpoints
4. [ ] Build pricing page UI
5. [ ] Add license dashboard
6. [ ] Implement webhook handlers
7. [ ] Test full payment flow
8. [ ] Update documentation

**This is the path to revenue. Polar + Stripe makes us legitimate like Mission Control HQ.**
