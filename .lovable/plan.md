I found two likely blockers:

1. The published site is serving the new startup cache-cleanup code, but it only clears old PWA caches once and does not force a second reload. If the first page load is still controlled by an old service worker, the new app can still appear blank.
2. The project currently has a build error in `cleanup-glow-posts` because it still imports `npm:@supabase/supabase-js@2.57.2`. This can block clean deployment/update flows.

Plan:

1. Fix the edge function build error
   - Update `supabase/functions/cleanup-glow-posts/index.ts` to use the same URL-based ESM import pattern already used in `check-subscription`.
   - Also update the remaining subscription edge functions that still use `npm:@supabase/supabase-js@2.57.2` so the same error does not appear next.

2. Make the PWA cleanup stronger for deployed users
   - Update `src/main.tsx` so that when old service workers/caches are found and removed, the app immediately reloads once with a cache-busting URL parameter.
   - Keep a safe localStorage flag so it cannot enter an infinite reload loop.
   - Still render the app normally if cleanup fails, if no old cache is found, or after the one-time reload.

3. Add a visible emergency recovery button on the root/auth screen
   - Add a small “Fix blank screen / update app” action on the first screen users can access.
   - It will clear service workers, browser caches, local storage/session storage as needed, then reload with a cache-busting parameter.
   - This is important because users who cannot reach Profile cannot use the existing “Check for Updates” button.

4. Improve startup resilience
   - Wrap the app mount in a lightweight fallback/error guard so if an unexpected startup error happens, users see a simple recovery message/button instead of a pure blank page.

5. Verify before handoff
   - Run the build after changes.
   - Confirm no `npm:@supabase/supabase-js` imports remain in edge functions.
   - Confirm the published recovery flow will require clicking **Update** in the publish dialog for frontend changes to go live.