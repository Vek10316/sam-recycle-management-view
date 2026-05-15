// app/queries/useLatestTransactionID.ts

import { fetchLatestTransactionID } from "@/services/transactions/transactionSettingsService";
import { useQuery } from "@tanstack/react-query";
import transactionKeys from "./transactionSettings.keys";

export default function useLatestTransactionIDQuery(type: "PURCHASES" | "SALES") {
  return useQuery({
    queryKey: transactionKeys.latestId(type),
    queryFn: () => fetchLatestTransactionID(type),
    enabled: !!type,
  });
}