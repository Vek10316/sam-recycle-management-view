const expensesRecordKeys = {
    all: ["expenses"] as const,
    detail: (id: string) => [...expensesRecordKeys.all, "detail", id] as const,
};

export default expensesRecordKeys;