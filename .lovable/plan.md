

## Add Coupon/Promo Code Zone to Profile Page

### What will change

**1. Coupon input section on the Profile page**
A new "Have a promo code?" section will appear below the Upgrade banner (only visible to non-subscribed, logged-in users). It will include:
- A text input for entering a coupon/promo code
- An "Apply" button that starts checkout with the coupon pre-applied

**2. Update the checkout edge function**
The `create-checkout` function will accept an optional `couponCode` in the request body. If provided, it will look up the coupon in Stripe and attach it to the checkout session via `discounts`, so the user sees the discounted price on the Stripe checkout page.

### Technical details

**Files to modify:**

| File | Change |
|------|--------|
| `supabase/functions/create-checkout/index.ts` | Accept optional `couponCode` from request body. If present, add `discounts: [{ coupon: couponCode }]` to the checkout session and enable `allow_promotion_codes` when no coupon is provided. |
| `src/pages/ProfilePage.tsx` | Add a promo code input + "Apply" button below the upgrade banner. On submit, call `handleCheckout` with the entered coupon code. Update `handleCheckout` to accept an optional coupon parameter and pass it in the function invoke body. |

**How it works:**
1. User enters a promo code and taps "Apply"
2. The code is sent to `create-checkout` edge function
3. Stripe validates the coupon -- if invalid, an error is returned and shown as a toast
4. If valid, the Stripe checkout page opens with the discount already applied
5. Users who click "Upgrade to Pro" without a coupon will also see a "Add promotion code" link on Stripe's checkout page (via `allow_promotion_codes`)

