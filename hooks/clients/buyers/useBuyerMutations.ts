//app/hooks/clients/buyers/useBuyerMutations.ts
import buyerKeys from "@/app/queries/buyer.keys";
import salesKeys from "@/app/queries/saleTransactions.keys";
import * as service from "@/services/api/clients/buyerService";
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useInsertBuyer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({buyer, vehicles}: {buyer: Omit<Buyer, "id">, vehicles: Pick<BuyerVehicles, "plate_no">[]}) => service.createBuyer(buyer, vehicles),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: buyerKeys.all,
            });
            Toast.show({
                type: "success",
                text1: "Successfully created new buyer!"
            })
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Failed to create buyer",
                text2: error.message
            })
        }
    })
}

export function useUpdateBuyer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, buyer, vehicles }: {
            id: number,
            buyer: Partial<Buyer>,
            vehicles: Omit<BuyerVehicles, "vehicle_id">[]}) => service.updateBuyer(id, buyer, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [buyerKeys.all, salesKeys.all],
            });

        }
    })
}