export interface PurchasesTransaction {
    transact_id: string;
    supplier_id: string;
    transact_date?: string;
    transact_address?: string;
    transact_total_amount: number;
    transact_status?: "UNPAID" | "PARTIAL" | "PAID";
};

export interface SalesTransaction {
    transact_id: string;
    buyer_id: string;
    transact_date?: string;
    transact_address?: string;
    transact_total_amount: number;
    transact_status?: string;
};

export interface TransactionDetails {
    detail_id: number;
    transact_id: string;
    stock_id: string;
    item_price: number;
    item_quantity: number;
    transact_subtotal: number;
};