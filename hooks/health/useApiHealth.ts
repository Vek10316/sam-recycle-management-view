import { apiStatus } from "@/api/apiStatus";
import apiHeatlhKeys from "@/app/queries/apiHealth.keys";
import { syncStockChangesUsingChangeId } from "@/offline_database/offlineStock";
import { offlineReadSyncMetadata, offlineUpsertLastChangeId } from "@/offline_database/offlineSyncMetadata";
import checkApiHealth from "@/services/api/health/apiHealthService";
import { readLastStockChange } from "@/services/api/stock/stockService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useApiHealth() {
    const { isError, data } = useQuery({
        queryKey: [apiHeatlhKeys.api_health],
        queryFn: checkApiHealth,
        retry: false,
        refetchInterval: 10000,
    });

    useEffect(() => {
        if (data === true) {
            apiStatus.setOnline();
            beginSyncMasterStock();
        } else if (data === false || isError) {
            apiStatus.setOffline();
        }
    }, [data, isError]);

    return {
        isOnline: data === true && !isError,
    };
}

async function beginSyncMasterStock() {
    const { change_id } = await readLastStockChange();
    const last_change_id = (await offlineReadSyncMetadata())?.find(o => o.table_name === "master_stock")?.last_change_id ?? 0;
    console.log(`Attempting sync, offlineID: ${last_change_id}, latestChange: ${change_id}`);
    if (change_id <= last_change_id) {
        return;
    } else {
        await syncStockChangesUsingChangeId(last_change_id);
        await offlineUpsertLastChangeId("master_stock", change_id);
    }
};