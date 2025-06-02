/*
  Warnings:

  - You are about to drop the column `choices` on the `simulation` table. All the data in the column will be lost.
  - You are about to drop the column `correctAction` on the `simulation` table. All the data in the column will be lost.
  - You are about to drop the column `scenario` on the `simulation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `simulation` DROP COLUMN `choices`,
    DROP COLUMN `correctAction`,
    DROP COLUMN `scenario`,
    ADD COLUMN `steps` JSON NULL;
