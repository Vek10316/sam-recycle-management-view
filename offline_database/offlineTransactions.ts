import { insertPurchaseTransaction } from "@/services/api/transactions/purchasesTransactionService";
import type { OfflinePurchasesTransaction, OfflinePurchasesTransactionListResult, OfflineSalesTransaction, OfflineSalesTransactionListResult, OfflineTransactionDetails } from "@/types/offlineTransactionType";
import { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";
import * as SQLite from "expo-sqlite";
import { getDbName } from "./offlineDatabase";

export async function offlineReadAllPurchases() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = "SELECT * FROM purchases_transactions";
        return await db.getAllAsync<OfflinePurchasesTransaction>(query);
    } catch (err) {
        throw err;
    }
};

export async function offlineReadPurchaseDetails(transact_id: number) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const purchaseQuery = "SELECT * FROM purchases_transactions WHERE transact_id = $transact_id";
        const detailsQuery = "SELECT * FROM purchases_transactions_details WHERE transact_id = $transact_id";
        const purchaseHeader = await db.getFirstAsync<OfflinePurchasesTransaction>(purchaseQuery, { $transact_id: transact_id });
        const purchaseDetails = await db.getAllAsync<OfflineTransactionDetails>(detailsQuery, { $transact_id: transact_id });
        return {
            header: purchaseHeader,
            details: purchaseDetails
        }
    } catch (err) {
        throw err;
    }
};

export async function offlineListPurchaseTransactions() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM purchases_transactions AS P
            LEFT JOIN (
                SELECT transact_id, SUM(item_quantity) AS total_quantity FROM purchases_transactions_details
                GROUP BY transact_id
            ) AS D ON P.transact_id = D.transact_id;
        `;
        const result = await db.getAllAsync<OfflinePurchasesTransactionListResult>(query);
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineInsertPurchase(header: Omit<OfflinePurchasesTransaction, "transact_id">, details: Omit<OfflineTransactionDetails, "detail_id" | "transact_id">[]) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const transact_id = await offlineGetLatestTransactd("PURCHASES") + 1;
        const insertHeader = `
            INSERT INTO purchases_transactions (transact_id, supplier_id, transact_date, transact_address, transact_total_amount, transact_status)
            VALUES (
                ${transact_id},
                '${header.supplier_id}',
                '${header.transact_date}',
                '${header.transact_address}',
                ${header.transact_total_amount},
                '${header.transact_status}'
            );
        `;

        const detailsRowsString = details.map(d => (`(
            '${transact_id}', '${d.stock_id}', ${d.item_price}, ${d.item_quantity}, ${d.transact_subtotal}
        )`)).join(", ");

        const insertDetails = `
            INSERT INTO purchases_transactions_details (transact_id, stock_id, item_price, item_quantity, transact_subtotal)
            VALUES ${detailsRowsString}
        `;

        await db.execAsync(insertHeader);
        await db.execAsync(insertDetails);

        const response = await offlineReadPurchaseDetails(transact_id);
        return response;
    } catch (err) {
        throw err;
    }
};

export async function offlineReadAllSales() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = "SELECT * FROM sales_transactions";
        return await db.getAllAsync<OfflineSalesTransaction>(query);
    } catch (err) {
        throw err;
    }
};

export async function offlineReadSaleDetails(transact_id: number) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const saleQuery = "SELECT * FROM sales_transactions WHERE transact_id = $transact_id";
        const detailsQuery = "SELECT * FROM sales_transactions_details WHERE transact_id = $transact_id";
        const saleHeader = await db.getFirstAsync<OfflineSalesTransaction>(saleQuery, { $transact_id: transact_id });
        const saleDetails = await db.getAllAsync<OfflineTransactionDetails>(detailsQuery, { $transact_id: transact_id });
        return {
            header: saleHeader,
            details: saleDetails
        }
    } catch (err) {
        throw err;
    }
};

export async function offlineListSaleTransactions() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM sales_transactions AS P
            LEFT JOIN (
                SELECT transact_id, SUM(item_quantity) AS total_quantity FROM sales_transactions_details
                GROUP BY transact_id
            ) AS D ON P.transact_id = D.transact_id;
        `;
        const result = await db.getAllAsync<OfflineSalesTransactionListResult>(query);
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineInsertSale(header: Omit<OfflineSalesTransaction, "transact_id">, details: Omit<OfflineTransactionDetails, "detail_id" | "transact_id">[]) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const transact_id = await offlineGetLatestTransactd("PURCHASES") + 1;
        const insertHeader = `
            INSERT INTO sales_transactions (transact_id, buyer_id, transact_date, transact_address, transact_total_amount, transact_status)
            VALUES (
                ${transact_id},
                '${header.buyer_id}',
                '${header.transact_date}',
                '${header.transact_address}',
                ${header.transact_total_amount},
                '${header.transact_status}'
            );
        `;

        const detailsRowsString = details.map(d => (`(
            '${transact_id}', '${d.stock_id}', ${d.item_price}, ${d.item_quantity}, ${d.transact_subtotal}
        )`)).join(", ");

        const insertDetails = `
            INSERT INTO sales_transactions_details (transact_id, stock_id, item_price, item_quantity, transact_subtotal)
            VALUES ${detailsRowsString}
        `;

        await db.execAsync(insertHeader);
        await db.execAsync(insertDetails);

        const response = await offlineReadSaleDetails(transact_id);
        return response;
    } catch (err) {
        throw err;
    }
};

export async function offlineGetLatestTransactd(type: "PURCHASES" | "SALES") {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT transact_id FROM ${type === "PURCHASES" ? "purchases_transactions" : "sales_transactions"} ORDER BY transact_id DESC LIMIT 1`;
        const result = await db.getFirstAsync<{ transact_id: number }>(query);
        return result === null || result === undefined ? 0 : result.transact_id;
    } catch (err) {
        throw err;
    }
};

export async function syncPurchaseTransaction(transact_id: number, supplier_id: number) {
    try {
        const { header, details } = await offlineReadPurchaseDetails(transact_id);

        if (header == null || details == null) return;

        const payload: {header: Omit<PurchasesTransaction, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]} = {
            header: {
                ...header,
                supplier_id
            },
            details: details.map(item => ({
                stock_id: item.stock_id,
                item_price: item.item_price,
                item_quantity: item.item_quantity,
                transact_subtotal: item.transact_subtotal
            }))
        };

        const result = await insertPurchaseTransaction(payload.header, payload.details);
        if (result.header !== undefined) await deleteOfflinePurchase(transact_id)
        return result;
    } catch (err) {
        throw err;
    }
};

export async function deleteOfflinePurchase(transact_id: number) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `DELETE FROM purchases_transactions WHERE transact_id = '${transact_id}'`;
        await db.execAsync(query);
    } catch (err) {
        throw err;
    }
};