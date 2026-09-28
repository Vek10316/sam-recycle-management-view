import { apiStatus } from "@/api/apiStatus";
import apiHeatlhKeys from "@/app/queries/apiHealth.keys";
import checkApiHealth from "@/services/api/health/apiHealthService";
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
        } else if (data === false || isError) {
            apiStatus.setOffline();
        }
    }, [data, isError]);

    return {
        isOnline: data === true && !isError,
    };
}