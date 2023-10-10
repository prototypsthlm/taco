/*
  Warnings:

  - A unique constraint covering the columns `[userId,chatId]` on the table `ChatUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatUser_userId_chatId_key" ON "ChatUser"("userId", "chatId");
