/*
  Warnings:

  - You are about to drop the column `Unit` on the `ItemMaster` table. All the data in the column will be lost.
  - Added the required column `unit` to the `ItemMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemMaster" DROP COLUMN "Unit",
ADD COLUMN     "unit" TEXT NOT NULL;
