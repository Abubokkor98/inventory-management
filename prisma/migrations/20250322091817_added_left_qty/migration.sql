/*
  Warnings:

  - Added the required column `leftQty` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseRequest" ADD COLUMN     "leftQty" INTEGER NOT NULL;
