/*
  Warnings:

  - You are about to drop the column `adminApproved` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerAssigned` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `adminApproved`,
    DROP COLUMN `workerAssigned`,
    DROP COLUMN `workerId`,
    ADD COLUMN `adminAssigned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `priceApprovedAt` DATETIME(3) NULL,
    ADD COLUMN `workerAccepted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workerAcceptedAt` DATETIME(3) NULL;
