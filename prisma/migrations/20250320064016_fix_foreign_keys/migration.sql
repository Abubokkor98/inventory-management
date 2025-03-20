-- RenameForeignKey
ALTER TABLE "PurchaseRequestItem" RENAME CONSTRAINT "PurchaseRequestItem_itemId_fkey" TO "fk_item_master";

-- RenameForeignKey
ALTER TABLE "PurchaseRequestItem" RENAME CONSTRAINT "PurchaseRequestItem_purchaseRequestId_fkey" TO "fk_purchase_request";
