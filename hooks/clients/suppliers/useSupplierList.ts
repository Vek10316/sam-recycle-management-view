//@/hooks/clients/suppliers/useSupplierList.ts
import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/api/clients/supplierService";
import type { ApiRequestParameters } from "@/types/apiRequestType";
import { useQuery } from "@tanstack/react-query";

export default function useSupplierList(params: ApiRequestParameters) {
    return useQuery({
        queryKey: [...supplierKeys.lists(), params.pageNo, params.pageSize, params.searchQuery],
        queryFn: () => service.listSuppliers(params),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}