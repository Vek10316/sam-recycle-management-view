// app/services/transactions/purchasesTransactionService.ts
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import type { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export async function insertPurchaseTransaction(header: Omit<PurchasesTransaction, 'transact_id'>, details: Omit<TransactionDetails, 'transact_id' | 'detail_id'>[]) {
    const payload = {
        header,
        details: details
    }
    const res = await fetch(`${API_URL}/purchases/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errorData = await res.json();
        
        throw new Error(errorData.message || "Failed to insert purchase transaction");
    }
    const json = await res.json();
    return json;
};

export const readPurchaseTransactions = async (filter?: Partial<PurchasesTransaction>): Promise<(PurchasesTransaction & {supplier_name: string})[]> => {
    const res = await fetch(`${API_URL}/purchases/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(filter),
    });
    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to fetch purchase transactions:", errorData);
        throw new Error(errorData.message || "Failed to fetch purchase transactions");
    }
    return await res.json();
};

export const updatePurchaseTransaction = async (transact_id: string, updateData: {header: Partial<Omit<PurchasesTransaction, 'transact_id'>>, details: Omit<TransactionDetails, 'detail_id'>[]}):
Promise<{header: PurchasesTransaction & {supplier_name: string}, details: TransactionDetails[]}> => {
    updateData.details = updateData.details.map(d => ({
        ...d,
        transact_id: transact_id,
    }));
    const res = await fetch(`${API_URL}/purchases/${transact_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        console.error(`Failed to update purchase transaction ${transact_id}:`, errorData);
        throw new Error(errorData.message || `Failed to update purchase transaction ${transact_id}`);
    }
    return res.json();
};

export const readFullPurchaseDetails = async (filter?: Partial<PurchasesTransaction>)
: Promise<{header: PurchasesTransaction,
    details: TransactionDetails[],
    supplier: Supplier,
    vehicles: SupplierVehicles[],
}[]> => {
    const res = await fetch(`${API_URL}/purchases/read-full-details/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
    });
    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to fetch full purchase details: ", errorData);
    }
    return res.json();
}

export const readPurchaseDetails = async (transact_id: string): Promise<{header: PurchasesTransaction & {supplier_name: string}, details: TransactionDetails[]}> => {
    const res = await fetch(`${API_URL}/purchases/details/${transact_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to fetch purchase details: ", errorData);
        throw new Error(errorData.message || "Failed to fetch purchase details");
    }
    return res.json();
};