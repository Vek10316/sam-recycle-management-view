export const supplierKeys = {
    all: ["suppliers"] as const,

    lists: () => [...supplierKeys.all, "list"] as const,
    vehicles: () => [...supplierKeys.all, "vehicles"] as const,
};