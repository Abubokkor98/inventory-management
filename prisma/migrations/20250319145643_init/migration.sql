-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_itemId_fkey";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "quantity" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
