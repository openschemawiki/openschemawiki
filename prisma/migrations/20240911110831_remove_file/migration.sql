/*
  Warnings:

  - You are about to drop the column `file` on the `Schema` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Schema_file_key";

-- AlterTable
ALTER TABLE "Schema" DROP COLUMN "file";
