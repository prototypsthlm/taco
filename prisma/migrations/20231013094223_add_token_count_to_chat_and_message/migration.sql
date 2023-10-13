-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "roleContentTokenCount" INTEGER;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "tokenCount" INTEGER;
