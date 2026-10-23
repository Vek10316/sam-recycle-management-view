const stockKeys = {
    all: ["stocks"] as const,
    categories: ["stock_categories"] as const,
    ids: ["stock_ids"] as const,
    prices: ["prices"] as const,
    detail: (stock_id: string) => ["stock", stock_id] as const,
    offline: ["offline_stock"] as const,
    offline_categories: ["offline_stock_categories"] as const
};

export default stockKeys;