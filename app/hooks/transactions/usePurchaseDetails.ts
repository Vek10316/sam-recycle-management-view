//@/app/hooks/transactions/usePurchaseDetails.ts

import type { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";
import { useCallback, useEffect, useState } from "react";

import * as service from "@/services/transactions/purchasesTransactionService";

export default function usePurchaseDetails(transact_id?: string) {
    const [purchaseHeader, setPurchaseHeader] =
        useState<PurchasesTransaction & {supplier_name: string} | null>(null);

    const [purchaseDetails, setPurchaseDetails] =
        useState<TransactionDetails[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!transact_id) return;

        // await new Promise(resolve => setTimeout(resolve, 3000));
        const transaction =
            await service.readPurchaseDetails(transact_id);

        setPurchaseHeader(transaction.header);
        setPurchaseDetails(transaction.details);
    }, [transact_id]);

    useEffect(() => {
        load();
    }, [load]);

    const insertPurchase = async (header: Omit<PurchasesTransaction, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]) => {
        const res = await service.insertPurchaseTransaction(header, details);

        if (res.header === undefined || res.error) {
            setError(res.error ?? "Insert failed");
            return;
        }

        await load();
        return res;
    };

    const updatePurchase = async (transact_id: string, updateData: {header: Omit<PurchasesTransaction, "transact_id">, details: Omit<TransactionDetails, "detail_id">[]}) => {
        const res = await service.updatePurchaseTransaction(transact_id, updateData);
        await load();
        return res;
    }

    return {
        purchaseHeader,
        purchaseDetails,
        insertPurchase,
        updatePurchase,
        loading,
        error,
        refetch: load,
        transact_id,
        setPurchaseHeader,
        setPurchaseDetails,
    };
}