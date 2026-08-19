//@/hooks/transactions/usePurchaseDetails.ts
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/transactions/purchasesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function usePurchaseDetails(transact_id: string) {
    if (transact_id === undefined || transact_id.trim() === "") {
        throw new Error("Invalid transact_id");
    }
    return useQuery({
        queryKey: purchasesKeys.detail(transact_id),
        queryFn: () => service.readPurchaseDetails(transact_id),
    });
};