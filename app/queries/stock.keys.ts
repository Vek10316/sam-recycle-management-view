const stockKeys = {
    all: ["stocks"] as const,
    prices: ["prices"] as const,
    detail: (stock_id: string) => ["stock", stock_id] as const,
};

export default stockKeys;