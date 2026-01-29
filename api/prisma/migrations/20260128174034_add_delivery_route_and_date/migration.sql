/*
  Warnings:

  - Added the required column `fromCity` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCity` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelDate` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "fromCity" TEXT NOT NULL,
ADD COLUMN     "toCity" TEXT NOT NULL,
ADD COLUMN     "travelDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Delivery_fromCity_toCity_travelDate_idx" ON "Delivery"("fromCity", "toCity", "travelDate");
