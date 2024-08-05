/*
  Warnings:

  - Added the required column `filename` to the `ChatTTS` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatTTS" DROP CONSTRAINT "ChatTTS_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ChatTTS" DROP CONSTRAINT "ChatTTS_userId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userId_fkey";

-- AlterTable
ALTER TABLE "ChatTTS" ADD COLUMN     "filename" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Authentication" (
    "token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_token_key" ON "Authentication"("token");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTTS" ADD CONSTRAINT "ChatTTS_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTTS" ADD CONSTRAINT "ChatTTS_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
