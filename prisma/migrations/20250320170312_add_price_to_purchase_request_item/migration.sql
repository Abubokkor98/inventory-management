/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PurchaseRequest` table. All the data in the column will be lost.
  - Added the required column `price` to the `PurchaseRequestItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_userId_fkey";

-- AlterTable
ALTER TABLE "PurchaseRequest" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "PurchaseRequestItem" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
