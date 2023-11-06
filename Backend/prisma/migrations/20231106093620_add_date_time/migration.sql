/*
  Warnings:

  - You are about to alter the column `fileDate` on the `file` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `file` MODIFY `fileDate` DATETIME(3) NULL;
