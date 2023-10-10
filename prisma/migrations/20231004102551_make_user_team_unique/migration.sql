/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamId]` on the table `UserTeam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserTeam_userId_teamId_key" ON "UserTeam"("userId", "teamId");
