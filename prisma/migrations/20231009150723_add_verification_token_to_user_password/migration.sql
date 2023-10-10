/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `Password` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `Password` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Password" ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Password_resetToken_key" ON "Password"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Password_verificationToken_key" ON "Password"("verificationToken");
