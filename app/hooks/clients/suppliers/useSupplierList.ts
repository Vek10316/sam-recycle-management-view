//@/app/hooks/clients/suppliers/useSupplierList.ts
import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/clients/supplierService";
import { useQuery } from "@tanstack/react-query";

export default function useSupplierList() {
    const supplierList = useQuery({
        queryKey: supplierKeys.lists(),
        queryFn: service.fetchSuppliers,
    });

    const vehicles = useQuery({
        queryKey: supplierKeys.vehicles(),
        queryFn: service.fetchSupplierVehicles,
    });

    return {
        supplierList,
        vehicles,
    };
}