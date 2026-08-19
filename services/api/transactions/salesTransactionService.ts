// app/services/transactions/salesTransactionService.ts
import { ApiPaginatedResponse } from "@/types/apiResponseType";
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import type { SalesTransaction, SalesTransactionListResult, TransactionDetails } from "@/types/transactionType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type SaleTransactionResponse = {
    header: SalesTransaction & {buyer_name: string},
    details: TransactionDetails[]
};

export const insertSaleTransaction = async (header: Omit<SalesTransaction, 'transact_id'>, details: Omit<TransactionDetails, 'transact_id' | 'detail_id'>[]):
Promise<SaleTransactionResponse> => {
    const payload = {
        header,
        details: details
    }
    const res = await fetch(`${API_URL}/sales/`, {
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

export const listSaleTransactions = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<SalesTransactionListResult[]>> => {
    const url = new URL(`${API_URL}/sales/list`);
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

export const updateSaleTransaction = async (transact_id: string, header: Partial<Omit<SalesTransaction, 'transact_id'>>, details: Omit<TransactionDetails, 'detail_id'>[]):
Promise<{header: SalesTransaction & {buyer_name: string}, details: TransactionDetails[]}> => {
    details = details.map(d => ({
        ...d,
        transact_id: transact_id,
    }));
    const res = await fetch(`${API_URL}/sales/${transact_id}`, {
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

export const readFullSaleDetails = async (transact_id: string)
: Promise<{header: SalesTransaction,
    details: TransactionDetails[],
    buyer: Buyer,
    vehicles: BuyerVehicles[],
}[]> => {
    const res = await fetch(`${API_URL}/sales/read-full-details/${transact_id}`, {
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

export const readSaleDetails = async (transact_id: string): Promise<{header: SalesTransaction & {buyer_name: string}, details: TransactionDetails[]}> => {
    const res = await fetch(`${API_URL}/sales/details/${transact_id}`, {
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