import * as service from "@/services/api/reports/reportService";
import { useCallback, useEffect, useState } from "react";

export const readMonthlyPurchasesTotal = (date: Date) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();
    const [purchasesTotal, setPurchasesTotal] = useState<number>();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const purchasesTotalRes = await service.readMonthlyPurchasesTotal(date);
            setPurchasesTotal(purchasesTotalRes);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        purchasesTotal,
        load,
    };
};

export const readMonthlyPurchasedItems = (date: Date) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();
    const [purchasedItems, setPurchasedItems] = useState<{ stock_id: string, item_quantity: number }[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const purchasedItemsRes = await service.readMonthlyPurchasedItems(date);
            setPurchasedItems(purchasedItemsRes);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        purchasedItems,
        load,
    };
};

export const readMonthlySalesTotal = (date: Date) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();
    const [salesTotal, setSalesTotal] = useState<number>();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const salesTotalRes = await service.readMonthlySalesTotal(date);
            setSalesTotal(salesTotalRes);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        salesTotal,
        load,
    };
};

export const readMonthlySoldItems = (date: Date) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();
    const [soldItems, setSoldItems] = useState<{ stock_id: string, item_quantity: number }[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const soldItemsRes = await service.readMonthlySoldItems(date);
            setSoldItems(soldItemsRes);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        soldItems,
        load,
    };
};

export const readMonthlyExpenses = (date: Date) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();
    const [expensesTotal, setExpensesTotal] = useState<number>();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const expensesRes = await service.readMonthlyExpenses(date);
            setExpensesTotal(expensesRes);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        expensesTotal,
        load,
    };
};