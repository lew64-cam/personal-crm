-- Create Contact table
CREATE TABLE IF NOT EXISTS "Contact" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "birthday" TEXT,
  "jobTitle" TEXT,
  "company" TEXT,
  "location" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "howWeMet" TEXT,
  "relationshipType" TEXT,
  "notes" TEXT,
  "linkedInUrl" TEXT,
  "twitterUrl" TEXT,
  "personalWebsiteUrl" TEXT,
  "tags" TEXT NOT NULL DEFAULT '',
  "lastContacted" TIMESTAMP(3),
  "reachOutIntervalDays" INTEGER,
  "birthdayReminderDays" INTEGER NOT NULL DEFAULT 0,
  "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ContactEntry table
CREATE TABLE IF NOT EXISTS "ContactEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "contactId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactEntry_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Contact_userId_idx" ON "Contact"("userId");
CREATE INDEX IF NOT EXISTS "Contact_relationshipType_idx" ON "Contact"("relationshipType");
CREATE INDEX IF NOT EXISTS "Contact_tags_idx" ON "Contact"("tags");
CREATE INDEX IF NOT EXISTS "ContactEntry_contactId_idx" ON "ContactEntry"("contactId");

-- Enable Row Level Security
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactEntry" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Contact
CREATE POLICY "Users can view their own contacts" ON "Contact"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own contacts" ON "Contact"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own contacts" ON "Contact"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own contacts" ON "Contact"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Create RLS policies for ContactEntry
CREATE POLICY "Users can view entries for their contacts" ON "ContactEntry"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact"."id" = "ContactEntry"."contactId"
      AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert entries for their contacts" ON "ContactEntry"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact"."id" = "ContactEntry"."contactId"
      AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update entries for their contacts" ON "ContactEntry"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact"."id" = "ContactEntry"."contactId"
      AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete entries for their contacts" ON "ContactEntry"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact"."id" = "ContactEntry"."contactId"
      AND "Contact"."userId" = auth.uid()::text
    )
  );

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Contact table
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON "Contact"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

