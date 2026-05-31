//@/hooks/stock/useStockList.ts
import stockKeys from "@/app/queries/stock.keys";
import * as service from "@/services/api/stock/stockService";
import { useQuery } from "@tanstack/react-query";

export default function useStockList() {
    const stockList = useQuery({
        queryKey: stockKeys.all,
        queryFn: () => service.readStock(),
    });
    const pricingHistory = useQuery({
        queryKey: stockKeys.prices,
        queryFn: () => service.readStockPricingHistory(),
    });
    return {
        stockList,
        pricingHistory,
    }
};