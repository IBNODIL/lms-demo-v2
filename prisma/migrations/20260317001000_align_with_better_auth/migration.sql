/*
  Warnings:

  - You are about to drop the index `Account_providerId_accountId_key` on the `Account` table. All data in the column will be lost.
  - You are about to drop the column `providerId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Account` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Account` table without a default value. This will fail if the table is not empty.
  - Added the required column `providerAccountId` to the `Account` table without a default value. This will fail if the table is not empty.

*/
-- DropIndex
DROP INDEX IF EXISTS "Account_providerId_accountId_key";

-- AlterTable
ALTER TABLE "Account" 
RENAME COLUMN "providerId" TO "provider";

-- AlterTable  
ALTER TABLE "Account"
RENAME COLUMN "accountId" TO "providerAccountId";

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
