//app/hooks/clients/suppliers/useSupplierMutations.ts
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/api/clients/supplierService";
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useInsertSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({supplier, vehicles}: {supplier: Supplier, vehicles: Omit<SupplierVehicles, "vehicle_id">[]}) => service.createSupplier(supplier, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierKeys.all,
            });
            Toast.show({
                type: "success",
                text1: "Successfully created new supplier!"
            })
        }
    })
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, supplier, vehicles }: {
            id: string,
            supplier: Partial<Supplier>,
            vehicles: Omit<SupplierVehicles, "vehicle_id">[]}) => service.updateSupplier(id, supplier, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [supplierKeys.all, purchasesKeys.all],
            });

        }
    })
}