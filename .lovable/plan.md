

## Update Subscription to $6.99 and Use Your Existing Stripe Product

### What needs to change

**1. Update the price ID in the checkout function**
The `create-checkout` edge function currently uses the price ID for the $4.99 product. It will be updated to use your existing $6.99 price: `price_1T1rhr21KLfTwdbbnYpeJdgG`.

**2. Update the UI text**
The Profile page currently shows "$4.99/mo" — this will be changed to "$6.99/mo".

**3. Adding a logo and description in Stripe Dashboard**
This cannot be done from Lovable — you need to do it directly in your Stripe Dashboard:
- Go to **Products** in your Stripe Dashboard
- Click on **FinalGlowAI**
- Click **Edit** and you can:
  - Upload your app logo as the product image
  - Update the description
- You can also **delete** the unused "FinalGlow Pro" product if you'd like to keep things clean

### Technical details

**Files to modify:**

| File | Change |
|------|--------|
| `supabase/functions/create-checkout/index.ts` | Replace price ID `price_1T1sBI21KLfTwdbbqqRexY8k` with `price_1T1rhr21KLfTwdbbnYpeJdgG` |
| `src/pages/ProfilePage.tsx` | Change "$4.99/mo" to "$6.99/mo" |

