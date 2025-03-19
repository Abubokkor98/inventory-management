-- CreateTable
CREATE TABLE "ItemMaster" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "Unit" TEXT NOT NULL,

    CONSTRAINT "ItemMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemMaster_sku_key" ON "ItemMaster"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_itemId_key" ON "Stock"("itemId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
