//app/hooks/transactions/useSaleTransactions.ts
import salesKeys from "@/app/queries/saleTransactions.keys";
import * as service from "@/services/api/transactions/salesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function useSaleTransactions(pageNo: number, pageSize: number, searchQuery?: string) {
    return useQuery({
        queryKey: [...salesKeys.all, pageNo, pageSize],
        queryFn: () => service.listSaleTransactions(pageNo, pageSize, searchQuery),

        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
};