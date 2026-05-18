ALTER TABLE public.glow_posts ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS glow_posts_is_seed_idx ON public.glow_posts(is_seed);