// app/queries/useTransactionSettings.ts

import { fetchTransactionSettings } from "@/services/transactions/transactionSettingsService";
import { useQuery } from "@tanstack/react-query";
import transactionKeys from "../../queries/transactionSettings.keys";

export default function useTransactionSettingsQuery() {
  return useQuery({
    queryKey: transactionKeys.settings(),
    queryFn: fetchTransactionSettings,
    staleTime: 1000 * 60 * 5, // cache 5 min
  });
}