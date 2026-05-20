-- User digest preferences table
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "digestEnabled" BOOLEAN NOT NULL DEFAULT false,
  "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
  "digestEmail" TEXT,
  "digestSendHour" INTEGER NOT NULL DEFAULT 9,
  "digestDayOfWeek" INTEGER NOT NULL DEFAULT 1,
  "lastDigestSentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_preferences_userId_key" UNIQUE ("userId")
);

CREATE INDEX IF NOT EXISTS "user_preferences_userId_idx" ON "user_preferences"("userId");

ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON "user_preferences"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own preferences" ON "user_preferences"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own preferences" ON "user_preferences"
  FOR UPDATE USING (auth.uid()::text = "userId");
