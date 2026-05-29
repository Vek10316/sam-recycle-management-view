//app/hooks/stock/useStockMutations.ts
import stockKeys from "@/app/queries/stock.keys";
import * as service from "@/services/stock/stockService";
import type { Stock, StockPricingHistory } from "@/types/stockType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type MutationOptions = {
    disableToast?: boolean;
}

export function useCreateStock(options?: MutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { stock: Stock, prices: Omit<StockPricingHistory, "history_id"> }) => service.createStock(params.stock, params.prices),

        onSuccess: (_, variables) => {
            Toast.show({
                type: "success",
                text1: "Insert success",
                text2: `Successfully insert stock ${variables.stock.stock_id}`
            });

            queryClient.invalidateQueries(
                { queryKey: stockKeys.all }
            );
        },

        onError: (error, variables) => {
            Toast.show({
                type: "error",
                text1: `Failed updating stock ${variables.stock.stock_id}`,
                text2: error.message
            })
        }
    });
}

export function useUpdateStock(options?: MutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stock_id: id, stock, prices }: { stock_id: string; stock: Partial<Stock>, prices?: Omit<StockPricingHistory, "history_id"> }) =>
            service.updateStock(id, stock, prices),

        onSuccess: (_, variables) => {
            Toast.show({
                type: "success",
                text1: "Update success",
                text2: `Successfully updated stock ${variables.stock_id}`
            });

            queryClient.invalidateQueries({
                queryKey: stockKeys.all
            });

            queryClient.invalidateQueries({
                queryKey: stockKeys.detail(variables.stock_id)
            });
        },

        onError: (error, variables) => {
            Toast.show({
                type: "error",
                text1: `Failed updating stock ${variables.stock_id}`,
                text2: error.message
            })
        }
    });
}