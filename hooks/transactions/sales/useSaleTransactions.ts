//app/hooks/transactions/useSaleTransactions.ts
import salesKeys from "@/app/queries/saleTransactions.keys";
import * as service from "@/services/api/transactions/salesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function useSaleTransactions() {
    return useQuery({
        queryKey: salesKeys.all,
        queryFn: () => service.readSaleTransactions(),
    });
};