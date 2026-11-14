const offlineTransactionsKeys = {
    purchases: ["offline_purchases"] as const,
    purchasesDetails: (transact_id: number) => [...offlineTransactionsKeys.purchases, transact_id] as const,
    sales: ["offline_sales"] as const,
    salesDetails: (transact_id: number) => [...offlineTransactionsKeys.sales, transact_id] as const,
};

export default offlineTransactionsKeys;