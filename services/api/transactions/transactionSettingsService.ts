// app/services/transactions/transactionSettingsService.ts
import type { TransactionSettings } from "@/types/transactionSettingsType";

export async function fetchTransactionSettings(): Promise<TransactionSettings[]> {
  const res = await fetch("/api/transaction-settings/");

  if (!res.ok) {
    throw new Error("Failed to fetch transaction settings");
  }

  return res.json();
}

export async function fetchLatestTransactionID(
  transaction_type: "PURCHASES" | "SALES"
): Promise<string> {
  const res = await fetch(
    `/api/transaction-settings/latest-transaction-id/${transaction_type}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch latest transaction ID");
  }

  const { latest_transaction_id } = await res.json();
  return latest_transaction_id;
}