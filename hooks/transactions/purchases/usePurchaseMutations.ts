import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/transactions/purchasesTransactionService";
import type { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({header, details}: {header: Omit<PurchasesTransaction, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]}) =>
            service.insertPurchaseTransaction(header, details),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchasesKeys.all
            });
        },
    });
}

export function useUpdatePurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({transact_id, header, details}: {
            transact_id: string,
            header: Partial<PurchasesTransaction>,
            details: Omit<TransactionDetails, "detail_id">[]
        }) => service.updatePurchaseTransaction(transact_id, header, details),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchasesKeys.all
            });
        },
    });
}