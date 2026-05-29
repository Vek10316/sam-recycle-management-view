//@/app/hooks/stock/useStockDetails.ts
import { stockKeys } from "@/app/queries/stock.keys";
import * as service from "@/services/stock/stockService";
import { useQuery } from "@tanstack/react-query";

export default function useStockDetails(stock_id: string) {
    if (stock_id.trim() === "") {
        throw new Error("Invalid stock_id");
    }
    return useQuery({
        queryKey: stockKeys.detail(stock_id!),
        queryFn: () => service.readStockDetails(stock_id!),
        enabled: !!stock_id,
    });
};