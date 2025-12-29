/*
  Warnings:

  - You are about to drop the column `priceApprovedAt` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `priceApprovedAt`,
    ADD COLUMN `workerAssigned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
