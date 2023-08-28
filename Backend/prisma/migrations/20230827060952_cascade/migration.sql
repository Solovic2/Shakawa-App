-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
