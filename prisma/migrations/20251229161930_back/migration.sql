/*
  Warnings:

  - You are about to drop the column `adminAssigned` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `adminAssignedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `adminNotes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `assignedWorkerId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerAccepted` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerAcceptedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerAssigned` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerCompletedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `workerStartedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_assignedWorkerId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_workerId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_customerId_fkey`;

-- DropIndex
DROP INDEX `Booking_assignedWorkerId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `Booking_invoiceNumber_key` ON `Booking`;

-- DropIndex
DROP INDEX `Booking_workerId_fkey` ON `Booking`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `adminAssigned`,
    DROP COLUMN `adminAssignedAt`,
    DROP COLUMN `adminNotes`,
    DROP COLUMN `assignedWorkerId`,
    DROP COLUMN `invoiceNumber`,
    DROP COLUMN `paymentStatus`,
    DROP COLUMN `workerAccepted`,
    DROP COLUMN `workerAcceptedAt`,
    DROP COLUMN `workerAssigned`,
    DROP COLUMN `workerCompletedAt`,
    DROP COLUMN `workerStartedAt`;

-- DropTable
DROP TABLE `Payment`;
