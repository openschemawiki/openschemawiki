/*
  Warnings:

  - A unique constraint covering the columns `[file]` on the table `Schema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file` to the `Schema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schema" ADD COLUMN     "file" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Schema_file_key" ON "Schema"("file");
