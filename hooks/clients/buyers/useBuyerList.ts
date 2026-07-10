//@/hooks/clients/buyers/useBuyerList.ts
import buyerKeys from "@/app/queries/buyer.keys";
import * as service from "@/services/api/clients/buyerService";
import { useQuery } from "@tanstack/react-query";

export default function useBuyerList(pageNo: number, pageSize: number, searchQuery?: string) {
    const buyerList = useQuery({
        queryKey: [...buyerKeys.lists(), pageNo, pageSize],
        queryFn: () => service.listBuyers(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const vehicles = useQuery({
        queryKey: [...buyerKeys.vehicles(), pageNo, pageSize, searchQuery],
        queryFn: () => service.fetchBuyerVehicles(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return {
        buyerList,
        vehicles,
    };
}