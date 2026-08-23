const purchasesKeys = {
    all: ["purchases"] as const,
    detail: (transact_id: string) => [...purchasesKeys.all, "detail", transact_id] as const,
};

export default purchasesKeys;