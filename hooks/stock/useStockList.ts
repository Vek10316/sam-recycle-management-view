//@/hooks/stock/useStockList.ts
import stockKeys from "@/app/queries/stock.keys";
import * as service from "@/services/api/stock/stockService";
import { useQuery } from "@tanstack/react-query";

export default function useStockList(pageNo: number, pageSize: number, searchQuery?: string) {
    const stockList = useQuery({
        queryKey: [...stockKeys.all, pageNo, pageSize],
        queryFn: () => service.listStock(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
    const pricingHistory = useQuery({
        queryKey: [...stockKeys.prices, pageNo, pageSize],
        queryFn: () => service.readStockPricingHistory(pageNo, pageSize, searchQuery),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
    const stockIds = useQuery({
        queryKey: [stockKeys.ids, pageNo, pageSize],
        queryFn: async () => (await service.listStock(pageNo, pageSize, searchQuery)).data.map(s => s.stock_id),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
    const categories = useQuery({
        queryKey: stockKeys.categories,
        queryFn: () => service.readStockCategories(),
        refetchOnReconnect: true,
    })
    return {
        stockList,
        categories,
        stockIds,
        pricingHistory,
    }
};