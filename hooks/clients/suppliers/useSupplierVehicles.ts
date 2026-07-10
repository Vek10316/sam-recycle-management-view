import supplierKeys from "@/app/queries/supplier.keys";
import * as service from "@/services/api/clients/supplierService";
import { useQuery } from "@tanstack/react-query";

export default function useSupplierVehicles(pageNo: number, pageSize: number, searchQuery?: string) {
  return useQuery({
    queryKey: [...supplierKeys.vehicles(), pageNo, pageSize],
    queryFn: () => service.fetchSupplierVehicles(pageNo, pageSize, searchQuery),
  })
};