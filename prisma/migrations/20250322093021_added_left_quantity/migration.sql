/*
  Warnings:

  - Added the required column `leftQuantity` to the `PurchaseRequestItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseRequestItem" ADD COLUMN     "leftQuantity" INTEGER NOT NULL;
