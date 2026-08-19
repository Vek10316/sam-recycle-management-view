const purchasesKeys = {
    all: ["purchases"] as const,
    detail: (id: string) => [...purchasesKeys.all, "detail", id] as const,
};

export default purchasesKeys;