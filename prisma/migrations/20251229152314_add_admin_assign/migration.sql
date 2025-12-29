-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `adminApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `adminAssignedAt` DATETIME(3) NULL,
    ADD COLUMN `adminNotes` VARCHAR(191) NULL,
    ADD COLUMN `assignedWorkerId` INTEGER NULL,
    ADD COLUMN `workerAssigned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workerCompletedAt` DATETIME(3) NULL,
    ADD COLUMN `workerStartedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_assignedWorkerId_fkey` FOREIGN KEY (`assignedWorkerId`) REFERENCES `Worker`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
