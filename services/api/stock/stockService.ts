import { ApiPaginatedResponse } from "@/types/apiResponseType";
import type * as StockTypes from "@/types/stockType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const readStock = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<StockTypes.Stock[]> => {
    const url = new URL(`${API_URL}/stock/inventory/`);
    url.searchParams.append("pageNo", pageNo.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (searchQuery) {
        url.searchParams.append("search", searchQuery);
    }
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock data: ", errorData);
    }
    return await res.json();
}

type StockListResult = StockTypes.Stock & {
    buy_price: number;
    sell_price: number;
};

export const listStock = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<StockListResult[]>> => {
    const url = new URL(`${API_URL}/stock/inventory/list`);
    url.searchParams.append("pageNo", pageNo.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (searchQuery) {
        url.searchParams.append("search", searchQuery);
    }
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock data: ", errorData);
    }
    return await res.json();
}

export const readStockCategories = async (): Promise<ApiPaginatedResponse<string[]>> => {
    const res = await fetch(`${API_URL}/stock/inventory/categories/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock categories: ", errorData);
    }
    return await res.json();
}

export const createStock = async (stock: StockTypes.Stock, prices: Omit<StockTypes.StockPricingHistory, "history_id">): Promise<{ stock: StockTypes.Stock, prices: StockTypes.StockPricingHistory }> => {
    const reqBody = {
        stock,
        prices,
    }
    const res = await fetch(`${API_URL}/stock/inventory`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody)
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to insert stock: ', errorData);
        return errorData;
    }
    return res.json();
};

export const updateStock = async (stock_id: string, stock: Partial<StockTypes.Stock>, prices?: Omit<StockTypes.StockPricingHistory, "history_id">): Promise<{ stock: StockTypes.Stock, prices: StockTypes.StockPricingHistory }> => {
    const res = await fetch(`${API_URL}/stock/inventory/${stock_id}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ stock, prices })
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
            "Content-Type": "application/json",
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

export const readStockPricingHistory = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<StockTypes.StockPricingHistory[]> => {
    const url = new URL(`${API_URL}/stock/pricing/`);
    url.searchParams.append("pageNo", pageNo.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (searchQuery) {
        url.searchParams.append("search", searchQuery);
    }
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to read stock pricing: ", errorData);
        return errorData;
    }
    const json = await res.json();
    return json;
}

export const readStockDetails = async (stock_id: string): Promise<{ stock: StockTypes.Stock, priceHistory: StockTypes.StockPricingHistory[] }> => {
    const res = await fetch(`${API_URL}/stock/inventory/${stock_id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
}

export const readStockMovement = async (pageNo: number, pageSize: number, searchQuery?: string): Promise<StockTypes.StockMovement[]> => {
    const url = new URL(`${API_URL}/stock/movement/`);
    url.searchParams.append("pageNo", pageNo.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (searchQuery) {
        url.searchParams.append("search", searchQuery);
    }
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};

export const createStockMovement = async (data: Omit<StockTypes.StockMovement, "movement_id">): Promise<StockTypes.StockMovement> => {
    const res = await fetch(`${API_URL}/stock/movement`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};

export const updateStockMovement = async (id: Pick<StockTypes.StockMovement, "movement_id">, data: StockTypes.StockMovement) => {
    const res = await fetch(`${API_URL}/stock/movement`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        return errorData;
    }
    return res.json();
};