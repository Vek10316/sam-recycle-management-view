//@/hooks/clients/suppliers/useSupplierList.ts
import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/api/clients/supplierService";
import { useQuery } from "@tanstack/react-query";

export default function useSupplierList(pageNo: number, pageSize: number, searchQuery?: string) {
    const supplierList = useQuery({
        queryKey: [...supplierKeys.lists(), pageNo, pageSize, searchQuery],
        queryFn: () => service.listSuppliers(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const vehicles = useQuery({
        queryKey: [...supplierKeys.vehicles(), pageNo, pageSize, searchQuery],
        queryFn: () => service.fetchSupplierVehicles(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return {
        supplierList,
        vehicles,
    };
}