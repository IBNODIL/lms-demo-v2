/*
  Warnings:

  - You are about to drop the index `Account_provider_providerAccountId_key` on the `Account` table. All data in the column will be lost.
  - You are about to drop the column `provider` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `Account` table without a default value. This will fail if the table is not empty.
  - Added the required column `accountId` to the `Account` table without a default value. This will fail if the table is not empty.

*/
-- DropIndex
DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";

-- AlterTable
ALTER TABLE "Account"
ADD COLUMN "providerId" TEXT,
ADD COLUMN "accountId" TEXT;

-- Copy data from provider to providerId, providerAccountId to accountId
UPDATE "Account" SET 
  "providerId" = COALESCE("provider", 'credential'),
  "accountId" = COALESCE("providerAccountId", "id");

-- Make them NOT NULL after data is set
ALTER TABLE "Account" 
ALTER COLUMN "providerId" SET NOT NULL,
ALTER COLUMN "accountId" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Account" 
DROP COLUMN "provider",
DROP COLUMN "providerAccountId";

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");
