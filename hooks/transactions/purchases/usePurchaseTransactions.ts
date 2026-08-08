//app/hooks/transactions/usePurchaseTransactions.ts
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/transactions/purchasesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function usePurchaseTransactions(pageNo: number, pageSize: number, searchQuery?: string) {
    return useQuery({
        queryKey: [...purchasesKeys.all, pageNo, pageSize, searchQuery],
        queryFn: () => service.listPurchaseTransactions(pageNo, pageSize, searchQuery),

        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
};