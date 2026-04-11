-- ==========================================
-- CIRCULO NOVELI - SOCIAL INTERACTIONS MIGRATION
-- ==========================================
-- Ejecuta este bloque completo en Supabase SQL Editor.
-- Crea persistencia para likes/comentarios del feed social
-- y habilita realtime + RLS.

BEGIN;

-- 1) TABLAS
CREATE TABLE IF NOT EXISTS public.review_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_reactions_unique UNIQUE (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) INDICES (mejora de rendimiento en conteos/listados)
CREATE INDEX IF NOT EXISTS idx_review_reactions_review_id ON public.review_reactions (review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user_id ON public.review_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON public.review_comments (review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON public.review_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created_at ON public.review_comments (created_at DESC);

-- 3) RLS
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- 4) POLITICAS review_reactions
DROP POLICY IF EXISTS "Users can view all review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can insert their own review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can delete their own review reactions" ON public.review_reactions;

CREATE POLICY "Users can view all review reactions"
  ON public.review_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own review reactions"
  ON public.review_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review reactions"
  ON public.review_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5) POLITICAS review_comments
DROP POLICY IF EXISTS "Users can view all review comments" ON public.review_comments;
DROP POLICY IF EXISTS "Users can insert their own review comments" ON public.review_comments;
DROP POLICY IF EXISTS "Users can delete their own review comments" ON public.review_comments;

CREATE POLICY "Users can view all review comments"
  ON public.review_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own review comments"
  ON public.review_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review comments"
  ON public.review_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6) REALTIME (opcional pero recomendado)
-- Agrega tablas a la publicacion de realtime para postgres_changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'review_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.review_reactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'review_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.review_comments;
  END IF;
END $$;

COMMIT;

-- Verificacion rapida
-- SELECT COUNT(*) FROM public.review_reactions;
-- SELECT COUNT(*) FROM public.review_comments;
