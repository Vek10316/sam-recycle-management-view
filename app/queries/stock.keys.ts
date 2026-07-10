const stockKeys = {
    all: ["stocks"] as const,
    categories: ["stock_categories"] as const,
    ids: ["stock_ids"] as const,
    prices: ["prices"] as const,
    detail: (stock_id: string) => ["stock", stock_id] as const,
};

export default stockKeys;