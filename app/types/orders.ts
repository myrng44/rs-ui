export type SaleLine = {
id?: string | number;
saleOrderId?: string;
productId: string | number;
productName: string;
qtyOrdered: number;
unitPrice: number;
totalPrice: number;
};


export type Order = {
id: string;
customerId?: string;
customerName?: string;
saleLines?: SaleLine[];
storeId?: number;
voucherCode?: string | null;
finalPrice?: number;
note?: string | null;
paymentMethodName?: string;
createdTime?: string;
fulfillmentStatus?: string;
};


export type Allocation = {
id: number;
saleLineId: number;
batchStockId: number;
qtyAllocated: number;
qtyPicked: number;
unitCostSnap: number;
batchCode?: string;
expiryDate?: string;
};