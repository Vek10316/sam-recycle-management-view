import type { PurchasesTransaction, SalesTransaction, TransactionDetails } from "./transactionType";

export type OfflinePurchasesTransaction = Omit<PurchasesTransaction, "transact_id" | "supplier_id"> & {
    transact_id: number;
    supplier_id: string;
    is_synced: number; // SQLite has no boolean type
};

export type OfflinePurchasesTransactionListResult = OfflinePurchasesTransaction & {
    total_quantity: number;
};

export type OfflineSalesTransaction = Omit<SalesTransaction, "transact_id" | "buyer_id"> & {
    transact_id: number;
    buyer_id: string;
    is_synced: number;
};

export type OfflineSalesTransactionListResult = OfflineSalesTransaction & {
    total_quantity: number;
};

export type OfflineTransactionDetails = Omit<TransactionDetails, "transact_id"> & {
    transact_id: number;
};