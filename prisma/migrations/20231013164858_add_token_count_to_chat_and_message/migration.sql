-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "roleContentTokenCount" INTEGER;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "answerTokenCount" INTEGER,
ADD COLUMN     "questionTokenCount" INTEGER;
