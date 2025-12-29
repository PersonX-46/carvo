-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `priceApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `priceRejected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL;
