const transactionKeys = {
  all: ["transaction-settings"] as const,
  settings: () => [...transactionKeys.all, "list"] as const,
  latestId: (type: "PURCHASES" | "SALES") =>
    [...transactionKeys.all, "latest-id", type] as const,
};

export default transactionKeys;