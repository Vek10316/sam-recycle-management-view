//app/hooks/clients/suppliers/useSupplierMutations.ts
import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/clients/supplierService";
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({supplier, vehicles}: {supplier: Supplier, vehicles: Omit<SupplierVehicles, "vehicle_id">[]}) => service.createSupplier(supplier, vehicles),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierKeys.all,
            });
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
                queryKey: supplierKeys.all,
            });
        }
    })
}