// app/hooks/transactions/useTransactionSettings.ts

import { useLatestTransactionIDQuery } from "@/app/queries/useLatestTransactionID";
import { useTransactionSettingsQuery } from "@/app/queries/useTransactionSettings";
import { useState } from "react";

type TransactType = "PURCHASES" | "SALES";

export default function useTransactionSettings() {
  const [transactType, setTransactionType] = useState<TransactType>("PURCHASES");

  const settingsQuery = useTransactionSettingsQuery();
  const latestIdQuery = useLatestTransactionIDQuery(transactType);

  return {
    transactType,
    setTransactionType,

    transactionSettings: settingsQuery.data ?? [],
    latestTransactionID: latestIdQuery.data ?? "",

    loading: settingsQuery.isLoading || latestIdQuery.isLoading,
    error: settingsQuery.error || latestIdQuery.error,

    refetchAll: () => {
      settingsQuery.refetch();
      latestIdQuery.refetch();
    },
  };
}