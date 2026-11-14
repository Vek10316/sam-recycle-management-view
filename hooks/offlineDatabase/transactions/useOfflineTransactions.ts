import offlineTransactionsKeys from "@/app/queries/offlineTransactions.keys";
import {
    offlineListPurchaseTransactions,
    offlineReadAllSales,
    offlineReadPurchaseDetails,
    offlineReadSaleDetails
} from "@/offline_database/offlineTransactions";
import { useQuery } from "@tanstack/react-query";

export default function useOfflineTransactions() {
    const offlinePurchasesList = useQuery({
        queryKey: offlineTransactionsKeys.purchases,
        queryFn: () => offlineListPurchaseTransactions()
    });

    const useOfflinePurchaseDetails = (transact_id: number) => useQuery({
        queryKey: offlineTransactionsKeys.purchasesDetails(transact_id),
        queryFn: () => offlineReadPurchaseDetails(transact_id)
    });

    const useOfflineSales = useQuery({
        queryKey: offlineTransactionsKeys.sales,
        queryFn: () => offlineReadAllSales()
    });

    const useOfflineSaleDetails = (transact_id: number) => useQuery({
        queryKey: offlineTransactionsKeys.salesDetails(transact_id),
        queryFn: () => offlineReadSaleDetails(transact_id)
    });

    return {
        offlinePurchasesList: offlinePurchasesList,
        useOfflinePurchaseDetails,
        useOfflineSales,
        useOfflineSaleDetails
    };
};