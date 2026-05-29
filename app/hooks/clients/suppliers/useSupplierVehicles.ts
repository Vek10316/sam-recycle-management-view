import { supplierKeys } from "@/app/queries/supplier.keys";
import * as service from "@/services/clients/supplierService";
import { useQuery } from "@tanstack/react-query";

export default function useSupplierVehicles() {
  return useQuery({
    queryKey: supplierKeys.vehicles(),
    queryFn: () => service.fetchSupplierVehicles(),
  })
};