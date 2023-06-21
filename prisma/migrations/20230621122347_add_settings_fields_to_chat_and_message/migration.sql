/*
  Warnings:

  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - Added the required column `question` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
ADD COLUMN     "roleContent" TEXT NOT NULL DEFAULT 'You are a helpful assistant.',
ADD COLUMN     "temperature" DECIMAL(2,1) NOT NULL DEFAULT 0.6;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "text",
ADD COLUMN     "answer" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "temperature" DECIMAL(2,1);
