//app/hooks/clients/buyers/useBuyerMutations.ts
import buyerKeys from "@/app/queries/buyer.keys";
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import * as service from "@/services/api/clients/buyerService";
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateBuyer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({buyer, vehicles}: {buyer: Buyer, vehicles: Omit<BuyerVehicles, "vehicle_id">[]}) => service.createBuyer(buyer, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: buyerKeys.all,
            });
        }
    })
}

export function useUpdateBuyer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, buyer, vehicles }: {
            id: string,
            buyer: Partial<Buyer>,
            vehicles: Omit<BuyerVehicles, "vehicle_id">[]}) => service.updateBuyer(id, buyer, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [buyerKeys.all, purchasesKeys.all],
            });

        }
    })
}