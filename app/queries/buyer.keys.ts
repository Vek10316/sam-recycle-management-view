const buyerKeys = {
    all: ["buyers"] as const,

    lists: () => [...buyerKeys.all, "list"] as const,
    vehicles: () => [...buyerKeys.all, "vehicles"] as const,
};

export default buyerKeys;