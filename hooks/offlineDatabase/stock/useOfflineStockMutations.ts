import stockKeys from "@/app/queries/stock.keys";
import { overwriteAllStock } from "@/offline_database/offlineStock";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useOverwriteAllStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => overwriteAllStock(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: stockKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: stockKeys.offline
            });
            queryClient.invalidateQueries({
                queryKey: stockKeys.categories
            });
            queryClient.invalidateQueries({
                queryKey: stockKeys.offline_categories
            });
            Toast.show({
                type: "success",
                text1: "Successfully overwritten all stock data!"
            });
        }
    });
};