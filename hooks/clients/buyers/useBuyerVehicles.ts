import buyerKeys from "@/app/queries/buyer.keys";
import * as service from "@/services/api/clients/buyerService";
import { useQuery } from "@tanstack/react-query";

export default function useBuyerVehicles(pageNo: number, pageSize: number, searchQuery?: string) {
  return useQuery({
    queryKey: [...buyerKeys.vehicles(), pageNo, pageSize],
    queryFn: () => service.fetchBuyerVehicles(pageNo, pageSize, searchQuery),
  })
};