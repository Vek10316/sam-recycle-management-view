//reportService.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;
import type { DateRange } from "@/types/apiResponseType";

export const readPurchasesTotalByDateRange = async (dateRange: DateRange): Promise<number> =>{ 
    const url = new URL(`${API_URL}/reports/monthly-purchases`);
    url.searchParams.append("startDate", dateRange.startDate.toLocaleDateString("en-CA"));
    url.searchParams.append("endDate", dateRange.endDate.toLocaleDateString("en-CA"));
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};

export const readPurchasedItemsByDateRange = async (dateRange: DateRange): Promise<{stock_id: string, item_quantity: number}[]> => {
    const url = new URL(`${API_URL}/reports/monthly-purchased-items`);
    url.searchParams.append("startDate", dateRange.startDate.toLocaleDateString("en-CA"));
    url.searchParams.append("endDate", dateRange.endDate.toLocaleDateString("en-CA"));
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: {stock_id: string, item_quantity: number}[]};
    const data = json.data;
    return data;
};

export const readSalesTotalByDateRange = async (dateRange: DateRange): Promise<number> =>{ 
    const url = new URL(`${API_URL}/reports/monthly-sales`);
    url.searchParams.append("startDate", dateRange.startDate.toLocaleDateString("en-CA"));
    url.searchParams.append("endDate", dateRange.endDate.toLocaleDateString("en-CA"));
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};

export const readSoldItemsByDateRange = async (dateRange: DateRange): Promise<{stock_id: string, item_quantity: number}[]> => {
    const url = new URL(`${API_URL}/reports/monthly-sold-items`);
    url.searchParams.append("startDate", dateRange.startDate.toLocaleDateString("en-CA"));
    url.searchParams.append("endDate", dateRange.endDate.toLocaleDateString("en-CA"));
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: {stock_id: string, item_quantity: number}[]};
    const data = json.data;
    return data;
};

export const readExpensesTotalByDateRange = async (dateRange: DateRange): Promise<number> => {
    const url = new URL(`${API_URL}/reports/monthly-expenses`);
    url.searchParams.append("startDate", dateRange.startDate.toLocaleDateString("en-CA"));
    url.searchParams.append("endDate", dateRange.endDate.toLocaleDateString("en-CA"));
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json() as {date: string, data: number};
    const data = json.data;
    return data;
};