//@/app/hooks/stock/useStock.ts
import type { Stock, StockPricingHistory } from "@/types/stockType";
import { useCallback, useEffect, useState } from "react";
import { readStock, readStockPricingHistory, updateStock, updateStockPrice } from "../../../services/stock/stockService";

export default function useStock() {
    const [stock, setStock] = useState<Stock[]>([])
    const [stockPriceHistory, setStockPriceHistory] = useState<StockPricingHistory[]>([]);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setloading(true);
        setError(null);

        try {
            const data = await readStock();
            setStock(data);
            const pricing = await readStockPricingHistory();
            setStockPriceHistory(pricing);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setloading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const editStock = async (updateData: Partial<Stock>) => {
        await updateStock(updateData);
        await load();
    };

    const editStockPrice = async (updateData: Omit<StockPricingHistory, 'history_id'>) => {
        await updateStockPrice(updateData);
        await load();
    };;
;
    return {
        stock,
        stockPriceHistory,
        loading,
        error,
        refetch: load,
        editStock,
        editStockPrice,
    };
}