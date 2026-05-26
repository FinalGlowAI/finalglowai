
-- Fix overly broad storage DELETE policy on glow-posts bucket
DROP POLICY IF EXISTS "Service role can delete glow images" ON storage.objects;

-- Fix public listing of glow-posts bucket (bucket remains public via CDN for file access)
DROP POLICY IF EXISTS "Glow images are publicly accessible" ON storage.objects;

-- Restrict glow_post_likes SELECT to authenticated users only
DROP POLICY IF EXISTS "Public can view glow likes" ON public.glow_post_likes;
CREATE POLICY "Authenticated users can view glow likes"
  ON public.glow_post_likes FOR SELECT
  TO authenticated
  USING (true);

-- Remove sensitive raw webhook payload column from play_subscriptions
ALTER TABLE public.play_subscriptions DROP COLUMN IF EXISTS raw_event;
