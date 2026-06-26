import type { ExpensesRecord } from "@/types/expensesRecordType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const readAllExpenses = async (): Promise<ExpensesRecord[]> => {
    const res = await fetch(`${API_URL}/expenses-record/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = res.json();
        return errorData;
    }

    return res.json();
};

export const readExpenseRecordByID = async (id: string): Promise<ExpensesRecord> => {
    const res = await fetch(`${API_URL}/expenses-record/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return res.json();
}

export const insertNewExpenseRecord = async (insertData: Omit<ExpensesRecord, "expense_id">): Promise<boolean> => {
    const res = await fetch(`${API_URL}/expenses-record/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(insertData)
    });

    if (!res.ok) {
        return false;
    } else {
        return true;
    }
};

export const updateExpenseRecord = async (id: string, updateData: Partial<ExpensesRecord>): Promise<ExpensesRecord> => {
    const res = await fetch(`${API_URL}/expenses-record/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData)
    });

    return res.json();
};