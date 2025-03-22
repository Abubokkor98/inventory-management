-- CreateEnum
CREATE TYPE "POStatus" AS ENUM ('WAITING', 'PARTIAL', 'COMPLETE');

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "remainingQty" INTEGER NOT NULL,
    "status" "POStatus" NOT NULL DEFAULT 'WAITING',
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "remainingQty" INTEGER NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceived" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,

    CONSTRAINT "GoodsReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceivedItem" (
    "id" TEXT NOT NULL,
    "goodsReceivedId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "GoodsReceivedItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "fk_po_item_master" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "fk_purchase_order" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceived" ADD CONSTRAINT "fk_goods_po" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceivedItem" ADD CONSTRAINT "fk_gr_item_master" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceivedItem" ADD CONSTRAINT "fk_goods_received" FOREIGN KEY ("goodsReceivedId") REFERENCES "GoodsReceived"("id") ON DELETE CASCADE ON UPDATE CASCADE;
