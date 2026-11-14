import stockKeys from "@/app/queries/stock.keys";
import * as offlineStockService from "@/offline_database/offlineStock";
import { useQuery } from "@tanstack/react-query";

export function useOfflineStock() {
    return useQuery({
        queryKey: stockKeys.offline,
        queryFn: () => offlineStockService.offlineReadStock(),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export function useOfflineStockCategories() {
    return useQuery({
        queryKey: stockKeys.offline_categories,
        queryFn: () => offlineStockService.offlineReadStockCategories(),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};