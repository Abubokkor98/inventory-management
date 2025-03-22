export class CreatePurchaseOrderDto {
  purchaseRequestId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    price: number; // Or i can get current price from ItemMaster
  }>;
}
