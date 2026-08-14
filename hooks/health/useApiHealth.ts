import { apiStatus } from "@/api/apiStatus";
import apiHeatlhKeys from "@/app/queries/apiHealth.keys";
import checkApiHealth from "@/services/api/health/apiHealthService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useApiHealth() {
    const { isSuccess, isError } = useQuery({
        queryKey: [apiHeatlhKeys.api_health],
        queryFn: checkApiHealth,
        retry: false,
        refetchInterval: 10000
    })

    useEffect(() => {
        if (isSuccess) {
            apiStatus.setOnline();
        }

        if (isError) {
            apiStatus.setOffline();
        }
    }, [isSuccess, isError]);
}