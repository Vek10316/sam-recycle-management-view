import * as service from "@/services/transactions/purchasesTransactionService";
import type {
    PurchasesTransaction,
    TransactionDetails
} from "@/types/transactionType";

import { useCallback, useState } from "react";

export default function usePurchaseTransactions() {
    const [filter, setFilter] = useState<Partial<PurchasesTransaction>>({});
    const [purchasesList, setPurchasesList] = useState<
        (PurchasesTransaction & { supplier_name: string })[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const purchases = await service.readPurchaseTransactions();
            setPurchasesList(purchases);
        } catch (err: any) {
            setError(
                err.message ?? "Failed to read purchase transactions"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createPurchaseTransaction = async (
        transaction: Omit<PurchasesTransaction, "transact_id">,
        details: Omit<
            TransactionDetails,
            "transact_id" | "detail_id"
        >[]
    ) => {
        const result =
            await service.insertPurchaseTransaction(
                transaction,
                details
            );

        await load();

        return result;
    };

    const editPurchaseTransaction = async (
        transact_id: string,
        updateData: {
            header: Partial<PurchasesTransaction>;
            details: Omit<TransactionDetails, "detail_id">[];
        }
    ) => {
        const result =
            await service.updatePurchaseTransaction(
                transact_id,
                updateData
            );

        await load();

        return result;
    };

    const readPurchaseTransactions = async (
        filter?: Partial<PurchasesTransaction>
    ) => {
        return await service.readPurchaseTransactions(filter);
    };

    const readFullPurchaseDetails = async (
        filter?: Partial<PurchasesTransaction>
    ) => {
        return await service.readFullPurchaseDetails(filter);
    };

    return {
        filter,
        purchasesList,
        loading,
        error,
        refetch: load,
        createPurchaseTransaction,
        editPurchaseTransaction,
        readPurchaseTransactions,
        readFullPurchaseDetails,
    };
}