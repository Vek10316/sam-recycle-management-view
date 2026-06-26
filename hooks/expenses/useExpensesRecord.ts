import * as service from "@/services/api/expenses/expensesRecordService";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { useCallback, useEffect, useState } from "react";

export function useExpensesRecordList() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [expensesRecord, setExpensesRecord] = useState<ExpensesRecord[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await service.readAllExpenses();

            setExpensesRecord(data);
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
        expensesRecord,
        loading,
        error,
        reload: load,
    };
}

export function useExpensesRecordDetails(expense_id: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [expensesRecord, setExpensesRecord] = useState<ExpensesRecord>();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await service.readExpenseRecordByID(expense_id);
            setExpensesRecord(data);
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
        expensesRecord
    }
};
