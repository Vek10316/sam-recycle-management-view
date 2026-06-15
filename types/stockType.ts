export interface Stock {
    stock_id: string;
    stock_description: string;
    stock_uom: "KG" | "PC";
    stock_category?: string;
    current_quantity: number;
}

export interface StockMovement {
    movement_id?: number;
    direction: "IN" | "OUT" | string;
    stock_id: string;
    transact_id?: string | undefined;
    quantity_change: number;
    movement_date: Date | string;
    remarks?: string;
}

export interface StockPricingHistory {
    history_id: number;
    stock_id: string;
    effective_date: Date | string;
    buy_price: number;
    sell_price: number;
}

export interface CreateStockResponse {
    stock: Stock,
    prices: StockPricingHistory, // Returns the latest pricing
}

export interface UpdateStockResponse {
    stock: Stock,
    prices: StockPricingHistory, // Returns the latest pricing
}