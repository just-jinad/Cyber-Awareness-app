-- AlterTable
ALTER TABLE `module` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    MODIFY `content` LONGTEXT NOT NULL;
