import buyerKeys from "@/app/queries/buyer.keys";
import * as service from "@/services/api/clients/buyerService";
import { useQuery } from "@tanstack/react-query";

export default function useBuyerVehicles() {
  return useQuery({
    queryKey: buyerKeys.vehicles(),
    queryFn: () => service.fetchBuyerVehicles(),
  })
};