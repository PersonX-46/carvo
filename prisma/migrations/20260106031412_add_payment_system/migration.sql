/*
  Warnings:

  - You are about to drop the column `reportedIssue` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `reportedIssue`,
    ADD COLUMN `amountPaid` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `balanceDue` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `paymentStatus` VARCHAR(191) NULL DEFAULT 'unpaid';

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentMethod` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,
    `completedDate` DATETIME(3) NULL,
    `paymentDetails` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_bookingId_key`(`bookingId`),
    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
