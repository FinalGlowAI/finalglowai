
-- Create storage bucket for glow post images
INSERT INTO storage.buckets (id, name, public) VALUES ('glow-posts', 'glow-posts', true);

-- Storage policies: authenticated users can upload to their own folder
CREATE POLICY "Users can upload glow images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'glow-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Anyone can view glow images (public bucket)
CREATE POLICY "Glow images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'glow-posts');

-- Users can delete their own glow images
CREATE POLICY "Users can delete own glow images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'glow-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role can delete expired images (for cleanup function)
CREATE POLICY "Service role can delete glow images"
ON storage.objects FOR DELETE
USING (bucket_id = 'glow-posts');

-- Create glow_posts table
CREATE TABLE public.glow_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.glow_posts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all posts (premium check in UI)
CREATE POLICY "Authenticated users can view glow posts"
ON public.glow_posts FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can create glow posts"
ON public.glow_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own glow posts"
ON public.glow_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create glow_post_likes table (using ✨ "glow" instead of heart)
CREATE TABLE public.glow_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.glow_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.glow_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view glow likes"
ON public.glow_post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can give a glow"
ON public.glow_post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their glow"
ON public.glow_post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_glow_posts_created_at ON public.glow_posts(created_at DESC);
CREATE INDEX idx_glow_posts_user_id ON public.glow_posts(user_id);
CREATE INDEX idx_glow_post_likes_post_id ON public.glow_post_likes(post_id);
CREATE INDEX idx_glow_post_likes_user_id ON public.glow_post_likes(user_id);
