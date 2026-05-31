//app/hooks/transactions/usePurchaseTransactions.ts
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/transactions/purchasesTransactionService";
import { useQuery } from "@tanstack/react-query";

export default function usePurchaseTransactions() {
    return useQuery({
        queryKey: purchasesKeys.all,
        queryFn: () => service.readPurchaseTransactions(),
    });
};