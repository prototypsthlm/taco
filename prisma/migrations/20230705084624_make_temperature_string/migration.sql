-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "temperature" SET DEFAULT '0.6',
ALTER COLUMN "temperature" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "temperature" SET DATA TYPE TEXT;
