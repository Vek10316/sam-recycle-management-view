import stockMovementKeys from "@/app/queries/stockMovement.keys";
import * as service from "@/services/api/stock/stockService";
import { useQuery } from "@tanstack/react-query";

const useStockMovement = (pageNo: number, pageSize: number, searchQuery?: string) => {
    return useQuery({
        queryKey: stockMovementKeys.all,
        queryFn: () => service.readStockMovement(pageNo, pageSize, searchQuery?.trim() !== "" ? searchQuery?.trim() : undefined),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })
}

export default useStockMovement;