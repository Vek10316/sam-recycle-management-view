const supplierKeys = {
    all: ["suppliers"] as const,
    lists: () => [...supplierKeys.all, "supplier_list"] as const,
    vehicles: () => [...supplierKeys.all, "supplier_vehicles"] as const,
};

export default supplierKeys;