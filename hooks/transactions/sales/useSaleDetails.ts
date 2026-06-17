//@/hooks/transactions/useSaleDetails.ts
import salesKeys from "@/app/queries/saleTransactions.keys";
import * as service from "@/services/api/transactions/salesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function useSaleDetails(transact_id: string) {
    if (transact_id.trim() === "") {
        throw new Error("Invalid transact_id");
    }
    return useQuery({
        queryKey: salesKeys.detail(transact_id),
        queryFn: () => service.readSaleDetails(transact_id),
    });
};