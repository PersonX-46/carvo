-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `receiptUrl` VARCHAR(191) NULL,
    ADD COLUMN `receiptVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedBy` VARCHAR(191) NULL;
