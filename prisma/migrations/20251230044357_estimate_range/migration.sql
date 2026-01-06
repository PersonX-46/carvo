-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `estimatedMaxCost` DOUBLE NULL,
    ADD COLUMN `estimatedMinCost` DOUBLE NULL,
    ADD COLUMN `finalCost` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `finalPriceSet` BOOLEAN NOT NULL DEFAULT false;
