import { listSuppliers } from "@/services/api/clients/supplierService";
import type { ApiRequestParameters } from "@/types/apiRequestType";

export default async function useSupplierSearch(params: Pick<ApiRequestParameters, "searchQuery">) {
    if (params.searchQuery == null || params.searchQuery?.trim() === "") return [];
    const res = await listSuppliers(params);
    return res;
};