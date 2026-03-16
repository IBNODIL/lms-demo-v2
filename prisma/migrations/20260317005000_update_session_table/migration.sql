-- AlterTable
ALTER TABLE "Session" 
ADD COLUMN "token" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "userAgent" TEXT;

-- Generate token for existing sessions
UPDATE "Session" SET "token" = "id" WHERE "token" IS NULL;

-- Make token NOT NULL after all rows have a value
ALTER TABLE "Session" 
ALTER COLUMN "token" SET NOT NULL;

-- Create unique constraint on token
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
