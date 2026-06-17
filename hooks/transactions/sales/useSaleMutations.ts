import salesKeys from "@/app/queries/saleTransactions.keys";
import * as service from "@/services/api/transactions/salesTransactionService";
import type { SalesTransaction, TransactionDetails } from "@/types/transactionType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({header, details}: {header: Omit<SalesTransaction, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]}) =>
            service.insertSaleTransaction(header, details),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: salesKeys.all
            });
        },
    });
}

export function useUpdateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({transact_id, header, details}: {
            transact_id: string,
            header: Partial<SalesTransaction>,
            details: Omit<TransactionDetails, "detail_id">[]
        }) => service.updateSaleTransaction(transact_id, header, details),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: salesKeys.all
            });
        },
    });
}