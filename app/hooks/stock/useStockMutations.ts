//app/hooks/stock/useStockMutations.ts
import { stockKeys } from "@/app/queries/stock.keys";
import * as service from "@/services/stock/stockService";
import type { Stock, StockPricingHistory } from "@/types/stockType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: {stock: Stock, prices: Omit<StockPricingHistory, "history_id">}) => service.createStock(params.stock, params.prices),

        onSuccess: () => {
            queryClient.invalidateQueries(
                { queryKey: stockKeys.all }
            );
        }
    });
}

export function useUpdateStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stock_id: id, stock, prices }: { stock_id: string; stock: Partial<Stock>, prices?: Omit<StockPricingHistory, "history_id"> }) =>
            service.updateStock(id, stock, prices),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: stockKeys.all
            });

            queryClient.invalidateQueries({
                queryKey: stockKeys.detail(variables.stock_id)
            });
        }
    });
}