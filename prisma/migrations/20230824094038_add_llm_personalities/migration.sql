-- CreateTable
CREATE TABLE "LlmPersonality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "LlmPersonality_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LlmPersonality" ADD CONSTRAINT "LlmPersonality_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
