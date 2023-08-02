/*
  Warnings:

  - You are about to drop the column `activeTeamId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserTeams` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[activeUserTeamId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_activeTeamId_fkey";

-- DropForeignKey
ALTER TABLE "UserTeams" DROP CONSTRAINT "UserTeams_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UserTeams" DROP CONSTRAINT "UserTeams_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activeTeamId",
ADD COLUMN     "activeUserTeamId" INTEGER;

-- DropTable
DROP TABLE "UserTeams";

-- CreateTable
CREATE TABLE "UserTeam" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER,

    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_activeUserTeamId_key" ON "User"("activeUserTeamId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeUserTeamId_fkey" FOREIGN KEY ("activeUserTeamId") REFERENCES "UserTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
