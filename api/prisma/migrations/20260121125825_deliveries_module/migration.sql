/*
  Warnings:

  - Added the required column `itemName` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_tripId_fkey";

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "itemName" TEXT NOT NULL,
ALTER COLUMN "tripId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Delivery_senderId_idx" ON "Delivery"("senderId");

-- CreateIndex
CREATE INDEX "Delivery_tripId_idx" ON "Delivery"("tripId");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
