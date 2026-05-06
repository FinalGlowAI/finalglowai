CREATE TABLE public.play_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  product_id TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  revenuecat_app_user_id TEXT,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.play_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own play subscription"
ON public.play_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_play_subscriptions_updated_at
BEFORE UPDATE ON public.play_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_play_subs_rc_user ON public.play_subscriptions(revenuecat_app_user_id);