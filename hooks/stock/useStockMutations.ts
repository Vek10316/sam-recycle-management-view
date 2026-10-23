//app/hooks/stock/useStockMutations.ts
import stockKeys from "@/app/queries/stock.keys";
import { offlineInsertStock, offlineUpdateStock, syncStockChangesUsingChangeId } from "@/offline_database/offlineStock";
import { offlineReadSyncMetadata, offlineUpsertLastChangeId } from "@/offline_database/offlineSyncMetadata";
import * as service from "@/services/api/stock/stockService";
import type { Stock, StockMovement, StockPricingHistory } from "@/types/stockType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type MutationOptions = {
    disableToast?: boolean;
}

export function useCreateStock(options?: MutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { stock: Stock, prices: Omit<StockPricingHistory, "history_id"> }) => {
            const { change_id } = await service.readLastStockChange();
            const syncMetadata = (await offlineReadSyncMetadata())?.find(v => v.table_name === "master_stock");
            if (syncMetadata === undefined || syncMetadata.last_change_id !== change_id) {
                await syncStockChangesUsingChangeId(syncMetadata?.last_change_id ?? 0);
            };
            const res = await service.createStock(params.stock, params.prices)
            await offlineInsertStock(params.stock);;
            await offlineUpsertLastChangeId("master_stock", change_id + 1);
            return res
        },

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
        mutationFn: async ({ stock_id: id, stock, prices }: { stock_id: string; stock: Partial<Stock>, prices?: Omit<StockPricingHistory, "history_id"> }) => {
            const { change_id } = await service.readLastStockChange();
            const syncMetadata = (await offlineReadSyncMetadata())?.find(v => v.table_name === "master_stock");
            if (syncMetadata === undefined || syncMetadata.last_change_id !== change_id) {
                await syncStockChangesUsingChangeId(syncMetadata?.last_change_id ?? 0);
            };
            const res = service.updateStock(id, stock, prices);
            await offlineUpdateStock(id, stock);
            await offlineUpsertLastChangeId("master_stock", change_id + 1);
            return res
        },

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

export function useUpdateStockPricing(options?: MutationOptions) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<StockPricingHistory, "history_id">) => service.updateStockPrice(data),
        onSuccess: () => {
            if (!options?.disableToast) {
                Toast.show({
                    type: "success",
                    text1: "Update success",
                    text2: "Successfully updating new stock movement"
                });
            }

            queryClient.invalidateQueries({
                queryKey: stockKeys.prices
            });
        },

        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Failed updating stock pricing",
                text2: error.message
            })
        }
    })
};

export function useCreateStockMovement(options?: MutationOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data }: { data: Omit<StockMovement, "movement_id"> }) =>
            service.createStockMovement(data),

        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: "Insert success",
                text2: "Successfully inserted new stock movement"
            });
        },

        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Failed inserting stock movement",
                text2: error.message
            })
        }
    })
}