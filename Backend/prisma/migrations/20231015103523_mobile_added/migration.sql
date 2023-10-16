/*
  Warnings:

  - You are about to drop the column `mobileNumber` on the `file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `mobileNumber`,
    ADD COLUMN `mobile` VARCHAR(191) NULL;
