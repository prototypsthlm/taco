-- DropIndex
DROP INDEX "User_resetToken_key";

-- AlterTable
-- We're not dropping the columns yet. We need them for data migration.

-- CreateTable
CREATE TABLE "Password"
(
    "id"         SERIAL       NOT NULL,
    "hash"       TEXT         NOT NULL,
    "resetToken" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    "userId"     INTEGER      NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password" ("userId");

-- Data Migration: Move data from User table to Password table
INSERT INTO "Password" ("hash", "resetToken", "userId", "createdAt", "updatedAt")
SELECT "password", "resetToken", "id", "createdAt", "updatedAt"
FROM "User"
WHERE "password" IS NOT NULL
   OR "resetToken" IS NOT NULL;

-- After migration, we can safely drop the columns from the User table
ALTER TABLE "User"
    DROP COLUMN "password",
    DROP COLUMN "resetToken";

-- AddForeignKey
ALTER TABLE "Password"
    ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
