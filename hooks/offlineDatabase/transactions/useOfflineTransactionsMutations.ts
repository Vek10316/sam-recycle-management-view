import offlineTransactionsKeys from "@/app/queries/offlineTransactions.keys";
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import { offlineInsertPurchase, offlineInsertSale, syncPurchaseTransaction } from "@/offline_database/offlineTransactions";
import type { OfflinePurchasesTransaction, OfflineSalesTransaction, OfflineTransactionDetails } from "@/types/offlineTransactionType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useOfflineInsertPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({header, details}: {header: Omit<OfflinePurchasesTransaction, "transact_id">, details: Omit<OfflineTransactionDetails, "transact_id" | "detail_id">[]}) => 
            offlineInsertPurchase(header, details),
        onSuccess: (res) => {
            Toast.show({
                type: "success",
                text1: `Transact ID: ${res.header!.transact_id}`,
                text2: "Purchase saved locally"
            });
            queryClient.invalidateQueries({
                queryKey: offlineTransactionsKeys.purchases
            });
        }
    })
};

export const useSyncPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({transact_id, supplier_id}: {transact_id: number, supplier_id: number}) => syncPurchaseTransaction(transact_id, supplier_id),
        onSuccess: (res) => {
            if (res === null || res === undefined) return;
            Toast.show({
                type: "success",
                text1: `Successfully synced purchase: ${res.header.transact_id}`
            });
            queryClient.invalidateQueries({
                queryKey: purchasesKeys.all
            });
        }
    });
};

export const useOfflineInsertSales = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({header, details}: {header: Omit<OfflineSalesTransaction, "transact_id">, details: Omit<OfflineTransactionDetails, "transact_id" | "detail_id">[]}) => 
            offlineInsertSale(header, details),
        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: "Sale saved locally"
            });
            queryClient.invalidateQueries({
                queryKey: offlineTransactionsKeys.sales
            });
        }
    })
};