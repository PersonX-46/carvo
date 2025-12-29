-- AlterTable
ALTER TABLE `Booking` MODIFY `priceApproved` BOOLEAN NULL DEFAULT false,
    MODIFY `priceRejected` BOOLEAN NULL DEFAULT false;
