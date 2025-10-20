/*
  Warnings:

  - A unique constraint covering the columns `[recordCode]` on the table `Military` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recordCode]` on the table `Militia` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Military" ADD COLUMN "recordCode" TEXT;

-- AlterTable
ALTER TABLE "Militia" ADD COLUMN "recordCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Military_recordCode_key" ON "Military"("recordCode");

-- CreateIndex
CREATE UNIQUE INDEX "Militia_recordCode_key" ON "Militia"("recordCode");
