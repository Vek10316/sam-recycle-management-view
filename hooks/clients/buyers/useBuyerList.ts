//@/hooks/clients/buyers/useBuyerList.ts
import buyerKeys from "@/app/queries/buyer.keys";
import * as service from "@/services/api/clients/buyerService";
import { useQuery } from "@tanstack/react-query";

export default function useBuyerList() {
    const buyerList = useQuery({
        queryKey: buyerKeys.lists(),
        queryFn: service.fetchBuyers,
    });

    const vehicles = useQuery({
        queryKey: buyerKeys.vehicles(),
        queryFn: service.fetchBuyerVehicles,
    });

    return {
        buyerList,
        vehicles,
    };
}