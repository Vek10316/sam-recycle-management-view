// app/services/transactions/purchasesTransactionService.ts
import { ApiPaginatedResponse } from "@/types/apiResponseType";
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import type { PurchasesTransaction, PurchasesTransactionListResult, TransactionDetails } from "@/types/transactionType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type PurchaseTransactionResponse = {
    header: PurchasesTransaction & {supplier_name: string},
    details: TransactionDetails[]
};

export const insertPurchaseTransaction = async (header: Omit<PurchasesTransaction, 'transact_id'>, details: Omit<TransactionDetails, 'transact_id' | 'detail_id'>[]):
Promise<PurchaseTransactionResponse> => {
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
        return errorData;
    }
    const json = await res.json();
    return json;
};

export const listPurchaseTransactions = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<PurchasesTransactionListResult[]>> => {
    const url = new URL(`${API_URL}/purchases/list`);
    url.searchParams.append("pageNo", pageNo.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (searchQuery) {
        url.searchParams.append("search", searchQuery);
    }
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return await res.json();
};

export const updatePurchaseTransaction = async (transact_id: string, header: Partial<Omit<PurchasesTransaction, 'transact_id'>>, details: Omit<TransactionDetails, 'detail_id'>[]):
Promise<{header: PurchasesTransaction & {supplier_name: string}, details: TransactionDetails[]}> => {
    details = details.map(d => ({
        ...d,
        transact_id: transact_id,
    }));
    const res = await fetch(`${API_URL}/purchases/${transact_id}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            header,
            details
        }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};

export const readFullPurchaseDetails = async (transact_id: string)
: Promise<{header: PurchasesTransaction,
    details: TransactionDetails[],
    supplier: Supplier,
    vehicles: SupplierVehicles[],
}[]> => {
    const res = await fetch(`${API_URL}/purchases/read-full-details/${transact_id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};

export const readPurchaseDetails = async (transact_id: string): Promise<{header: PurchasesTransaction & {supplier_name: string}, details: TransactionDetails[]}> => {
    const res = await fetch(`${API_URL}/purchases/details/${transact_id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    })
    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};