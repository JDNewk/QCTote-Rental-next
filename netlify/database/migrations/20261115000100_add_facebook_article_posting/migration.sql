DO $$ BEGIN
  CREATE TYPE "FacebookPostStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'POSTED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "facebook_blurb" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook_posting_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "facebook_post_status" "FacebookPostStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
  ADD COLUMN IF NOT EXISTS "facebook_post_id" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook_post_url" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook_posted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "facebook_last_attempt_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "facebook_attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "facebook_post_error" TEXT;

CREATE INDEX IF NOT EXISTS "articles_facebook_post_status_published_at_idx"
  ON "articles"("facebook_post_status", "published_at");
