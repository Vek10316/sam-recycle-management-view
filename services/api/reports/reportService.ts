const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const readMonthlyPurchasesTotal = async (date: Date): Promise<number> =>{ 
    const res = await fetch(`${API_URL}/reports/monthly-purchases-total?date=${date.toLocaleDateString("en-CA")}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};

export const readMonthlyPurchasedItems = async (date: Date): Promise<{stock_id: string, item_quantity: number}[]> => {
    const res = await fetch(`${API_URL}/reports/monthly-purchased-items?date=${date.toLocaleDateString("en-CA")}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: {stock_id: string, item_quantity: number}[]};
    const data = json.data;
    return data;
};

export const readMonthlyExpenses = async (date: Date): Promise<number> => {
    const res = await fetch(`${API_URL}/reports/monthly-expenses?date=${date.toLocaleDateString("en-CA")}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};

export const readMonthlySalesTotal = async (date: Date): Promise<number> =>{ 
    const res = await fetch(`${API_URL}/reports/monthly-sales-total?date=${date.toLocaleDateString("en-CA")}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};

export const readMonthlySoldItems = async (date: Date): Promise<{stock_id: string, item_quantity: number}[]> => {
    const res = await fetch(`${API_URL}/reports/monthly-sold-items?date=${date.toLocaleDateString("en-CA")}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: {stock_id: string, item_quantity: number}[]};
    const data = json.data;
    return data;
};