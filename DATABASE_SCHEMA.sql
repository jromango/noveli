-- Círculo Noveli - Database Schema

-- User Profiles Table (Gamification)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Lector Curioso',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookshelf Table (User's books with metadata)
CREATE TABLE bookshelf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_book_id TEXT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  genre TEXT,
  progress INTEGER DEFAULT 0,
  total_pages INTEGER NOT NULL,
  current_page INTEGER DEFAULT 0,
  published_date TEXT,
  synopsis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes Table (User reviews)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  thumbnail TEXT,
  notes TEXT NOT NULL,
  rating INTEGER DEFAULT 0,
  isPublic BOOLEAN DEFAULT TRUE,
  bookId TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows Table (User relationships)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (follower_id, followed_id)
);

-- Followed titles table (favorite/book tracking)
CREATE TABLE IF NOT EXISTS book_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, title, author)
);

-- Add optional user profile fields for display
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Gamification Log
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'ADD_BOOK', 'SCAN_BOOK', 'WRITE_REVIEW'
  xp_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social interactions on seed/community reviews
CREATE TABLE IF NOT EXISTS review_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookshelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_follows ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Profiles are visible when public or owner"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id
    OR COALESCE((to_jsonb(user_profiles) ->> 'is_private')::boolean, false) = false
  );

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for bookshelf
CREATE POLICY "Users can view their own bookshelf"
  ON bookshelf FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON bookshelf FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON bookshelf FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON bookshelf FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for notes
CREATE POLICY "Notes are visible when public or owner"
  ON notes FOR SELECT
  USING (
    auth.uid() = user_id
    OR COALESCE(
      (to_jsonb(notes) ->> 'isPublic')::boolean,
      (to_jsonb(notes) ->> 'ispublic')::boolean,
      false
    ) = true
  );

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for xp_logs
CREATE POLICY "Users can view their own xp logs"
  ON xp_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own xp logs"
  ON xp_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for review_reactions
CREATE POLICY "Users can view all review reactions"
  ON review_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own review reactions"
  ON review_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review reactions"
  ON review_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for review_comments
CREATE POLICY "Users can view all review comments"
  ON review_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own review comments"
  ON review_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for follows
CREATE POLICY "Users can view follow relationships involving themselves"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = followed_id);

CREATE POLICY "Users can insert their own follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Policies for book_follows
CREATE POLICY "Users can view their own followed titles"
  ON book_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own followed titles"
  ON book_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own followed titles"
  ON book_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Compatibility RLS for installations using `profiles` or `activity_feed`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Profiles are visible when public or owner" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
    EXECUTE $policy$
      CREATE POLICY "Profiles are visible when public or owner"
      ON public.profiles FOR SELECT
      USING (
        auth.uid() = id
        OR COALESCE((to_jsonb(profiles) ->> 'is_private')::boolean, false) = false
      )
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id)
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
    $policy$;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_feed'
  ) THEN
    EXECUTE 'ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Activity feed is readable when public or owner" ON public.activity_feed';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own activity feed rows" ON public.activity_feed';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own activity feed rows" ON public.activity_feed';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own activity feed rows" ON public.activity_feed';
    EXECUTE $policy$
      CREATE POLICY "Activity feed is readable when public or owner"
      ON public.activity_feed FOR SELECT
      USING (
        auth.uid() = user_id
        OR COALESCE(
          (to_jsonb(activity_feed) ->> 'is_public')::boolean,
          (to_jsonb(activity_feed) ->> 'isPublic')::boolean,
          false
        ) = true
      )
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Users can insert their own activity feed rows"
      ON public.activity_feed FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Users can update their own activity feed rows"
      ON public.activity_feed FOR UPDATE
      USING (auth.uid() = user_id)
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Users can delete their own activity feed rows"
      ON public.activity_feed FOR DELETE
      USING (auth.uid() = user_id)
    $policy$;
  END IF;
END
$$;
