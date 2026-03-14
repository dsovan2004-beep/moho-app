-- ─────────────────────────────────────────────────────────────────────────────
-- MoHo Local — Post Reactions
-- Run this once in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Table
CREATE TABLE IF NOT EXISTS post_reactions (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reaction_type TEXT        NOT NULL CHECK (reaction_type IN ('helpful','love','funny','thanks','following')),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),

  -- One reaction per type per IP per post
  UNIQUE (post_id, reaction_type, ip_hash)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type    ON post_reactions(post_id, reaction_type);

-- 3. RLS
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reaction counts
CREATE POLICY "Public read post_reactions"
  ON post_reactions FOR SELECT USING (true);

-- Anyone can insert (unique constraint prevents duplicates)
CREATE POLICY "Public insert post_reactions"
  ON post_reactions FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Toggle RPC — called by the edge API route
--    SECURITY DEFINER so it can delete/insert regardless of RLS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION toggle_reaction(
  p_post_id       UUID,
  p_reaction_type TEXT,
  p_ip_hash       TEXT,
  p_user_id       UUID DEFAULT NULL
)
RETURNS TABLE(action TEXT, counts JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_counts JSONB;
BEGIN
  -- Check if this IP already reacted with this type on this post
  SELECT EXISTS(
    SELECT 1 FROM post_reactions
    WHERE post_id       = p_post_id
      AND reaction_type = p_reaction_type
      AND ip_hash       = p_ip_hash
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove reaction (toggle off)
    DELETE FROM post_reactions
    WHERE post_id       = p_post_id
      AND reaction_type = p_reaction_type
      AND ip_hash       = p_ip_hash;
  ELSE
    -- Add reaction (toggle on)
    INSERT INTO post_reactions(post_id, reaction_type, ip_hash, user_id)
    VALUES (p_post_id, p_reaction_type, p_ip_hash, p_user_id)
    ON CONFLICT (post_id, reaction_type, ip_hash) DO NOTHING;
  END IF;

  -- Return fresh counts for this post
  SELECT jsonb_object_agg(reaction_type, cnt) INTO v_counts
  FROM (
    SELECT reaction_type, COUNT(*)::INT AS cnt
    FROM post_reactions
    WHERE post_id = p_post_id
    GROUP BY reaction_type
  ) t;

  RETURN QUERY SELECT
    CASE WHEN v_exists THEN 'removed'::TEXT ELSE 'added'::TEXT END,
    COALESCE(v_counts, '{}'::JSONB);
END;
$$;

-- Allow anon and authenticated users to call the function
GRANT EXECUTE ON FUNCTION toggle_reaction TO anon;
GRANT EXECUTE ON FUNCTION toggle_reaction TO authenticated;
