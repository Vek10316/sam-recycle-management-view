import type * as StockTypes from "@/types/stockType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function readStock () {
    const res = await fetch(`${API_URL}/stock/inventory/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock data: ", errorData);
        throw new Error(errorData.message || "Failed to read stock data");
    }
    return await res.json();
}

export const insertStock = async (stock: StockTypes.Stock) => {
    const stockRes = await fetch(`${API_URL}/stock/inventory`, {
       method: 'POST',
       headers: {
            'Content-Type': 'application/json'
       },
       body: JSON.stringify(stock)
    });

    if (!stockRes.ok) {
        const errorData = await stockRes.json();
        console.error('Failed to insert stock: ', errorData);
        return errorData;
    }
    return stockRes.json();
};

export const updateStock = async (stock: Partial<StockTypes.Stock>) => {
    const res = await fetch(`${API_URL}/stock`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(stock)
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to update stock data: ', errorData);
        return errorData;
    }

    return res.json();
};

export const updateStockPrice = async (stockPricing: Omit<StockTypes.StockPricingHistory, 'history_id'>) => {
    const priceRes = await fetch(`${API_URL}/stock/pricing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockPricing)
    });

    if (!priceRes.ok) {
        const errorData = await priceRes.json();
        console.error("Failed to insert stock price: ", errorData);
        return errorData;
    }

    return priceRes.json();
};

export const readStockPricingHistory = async (filter?: Partial<StockTypes.StockPricingHistory>): Promise<StockTypes.StockPricingHistory[]> => {
    const res = await fetch(`${API_URL}/stock/pricing`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: filter ? JSON.stringify(filter) : undefined
    })

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock pricing: ", errorData);
        return errorData;
    }
    const json = await res.json();
    return json;
}