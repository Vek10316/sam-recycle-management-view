import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/transactions/purchasesTransactionService";
import type { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useInsertPurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({header, details}: {header: Omit<PurchasesTransaction, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]}) =>
            service.insertPurchaseTransaction(header, details),
        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: "Successfully created new purchase"
            })
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
            Toast.show({
                type: "success",
                text1: "Successfully updated purchase"
            })
            queryClient.invalidateQueries({
                queryKey: purchasesKeys.all
            });
        },
    });
}