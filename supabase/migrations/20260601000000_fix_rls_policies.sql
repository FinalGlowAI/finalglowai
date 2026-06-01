-- =============================================================================
-- 1. usage_logs — activation RLS (table sans aucune protection)
-- =============================================================================

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
ON public.usage_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- =============================================================================
-- 2. play_subscriptions — bloquer les écritures directes (risque de fraude)
-- =============================================================================

CREATE POLICY "No direct client insert on play_subscriptions"
ON public.play_subscriptions FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct client update on play_subscriptions"
ON public.play_subscriptions FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct client delete on play_subscriptions"
ON public.play_subscriptions FOR DELETE
TO authenticated
USING (false);


-- =============================================================================
-- 3. glow_posts — politique UPDATE + protection des champs système
-- =============================================================================

CREATE POLICY "Users can update own glow posts"
ON public.glow_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_glow_posts_system_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.bonus_glows := OLD.bonus_glows;
  NEW.is_seed     := OLD.is_seed;
  NEW.user_id     := OLD.user_id;
  NEW.created_at  := OLD.created_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_glow_posts_system_fields
BEFORE UPDATE ON public.glow_posts
FOR EACH ROW EXECUTE FUNCTION public.protect_glow_posts_system_fields();
