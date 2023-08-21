/*
  Warnings:

  - Made the column `sessionId` on table `UserSession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "sessionId" SET NOT NULL;
