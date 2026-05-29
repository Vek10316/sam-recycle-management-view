const salesKeys = {
    all: ["sales"] as const,
    detail: (transact_id: string) => ["sale", transact_id] as const,
};

export default salesKeys;