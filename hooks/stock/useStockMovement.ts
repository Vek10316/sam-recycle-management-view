//hooks/stock/useStockMovement.ts
import * as service from "@/services/api/stock/stockService";
import type { StockMovement } from "@/types/stockType";
import { useCallback, useState } from "react";

export default function useStockMovement() {
    const [stockMovementList, setStockMovementList] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const load = useCallback(async () => {
        try {
            setLoading(true);
            const movementData = await service.readStockMovement();
            setStockMovementList(movementData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect(() => {
    //     load();
    // }, [load]);

    return {
        stockMovementList,
        loading,
        error,
        load,
    }
};