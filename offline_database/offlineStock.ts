import {
    listStock,
    readLastStockChange,
    readStockChanges,
    readStockDetails,
} from "@/services/api/stock/stockService";
import type * as StockTypes from "@/types/stockType";
import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";
import { getDbName } from "./offlineDatabase";
import { offlineUpsertLastChangeId } from "./offlineSyncMetadata";

export async function offlineReadStock() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM master_stock`;
        const result = await db.getAllAsync<StockTypes.Stock>(query);
        await db.closeAsync();
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineReadStockCategories() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT DISTINCT stock_category FROM master_stock`;
        const result = await db.getAllAsync<Pick<StockTypes.Stock, "stock_category">>(query);
        await db.closeAsync();
        return result.flatMap(r => r.stock_category);
    } catch (err) {
        throw err;
    }
};

export async function offlineReadStockById(id: string) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM master_stock WHERE stock_id = '${id}'`;
        const result = await db.getFirstAsync<StockTypes.Stock>(query);
        await db.closeAsync();
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineInsertStock(stock: StockTypes.Stock): Promise<boolean> {
    try {
        const query =
            `INSERT INTO master_stock (
            stock_id, stock_category, stock_description, stock_uom, current_quantity, buy_price, sell_price
        ) VALUES (
            $stock_id, $stock_category, $stock_description, $stock_uom, $current_quantity, $buy_price, $sell_price
        )`;

        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const result = await db.runAsync(query, {
            $stock_id: stock.stock_id,
            $stock_category: stock.stock_category,
            $stock_description: stock.stock_description,
            $stock_uom: stock.stock_uom,
            $current_quantity: stock.current_quantity,
            $buy_price: stock.buy_price,
            $sell_price: stock.sell_price
        });
        await db.closeAsync();
        return result.changes > 0;
    } catch (err) {
        throw err;
    }
};
export async function offlineUpdateStock(stock_id: string, stock: Partial<StockTypes.Stock>): Promise<boolean> {
    try {
        const query = `UPDATE master_stock SET
            ${stock.stock_category !== undefined && `stock_category = '${stock.stock_category}',`}
            ${stock.stock_description !== undefined && `stock_description = '${stock.stock_description}',`}
            ${stock.stock_uom !== undefined && `stock_uom = '${stock.stock_uom}',`}
            ${stock.current_quantity !== undefined && `current_quantity = ${stock.current_quantity},`}
            ${stock.buy_price !== undefined && `buy_price = ${stock.buy_price},`}
            ${stock.sell_price !== undefined && `sell_price = ${stock.sell_price}`}
        WHERE stock_id = ${stock_id}`;
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const result = await db.runAsync(query);
        await db.closeAsync();
        return result.changes > 0;
    } catch (err) {
        throw err;
    }
};

export async function listStockChangesUsingLastId(last_change_id: number) {
    try {
        return await readStockChanges({ last_change_id: last_change_id });
    } catch (err) {
        throw err;
    }
};

export async function syncStockChangesUsingChangeId(last_change_id: number) {
    try {
        const stockIds = (await listStockChangesUsingLastId(last_change_id)).flatMap(v => v.stock_id);
        const stocks = await readStockDetails(`${stockIds.join(",")}`);
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const offlineStockIds = (await db.getAllAsync<StockTypes.Stock>(`SELECT * FROM master_stock`)).flatMap(o => o.stock_id);
        if (Array.isArray(stocks)) {
            for (const row of stocks) {
                const stock = row.stock;
                const exists = offlineStockIds.includes(stock.stock_id);
                const query = exists ?
                    `UPDATE master_stock SET 
                    stock_category = $stock_category,
                    stock_description = $stock_description,
                    stock_uom = $stock_uom,
                    current_quantity = $current_quantity,
                    buy_price = $buy_price,
                    sell_price = $sell_price
                    WHERE stock_id = $stock_id;
                `
                    :
                    `INSERT INTO master_stock (
                    stock_id, stock_category, stock_description, stock_uom, current_quantity, buy_price, sell_price
                ) VALUES (
                    $stock_id, $stock_category, $stock_description, $stock_uom, $current_quantity, $buy_price, $sell_price
                )`;

                await db.runAsync(query, {
                    $stock_id: stock.stock_id,
                    $stock_category: stock.stock_category,
                    $stock_description: stock.stock_description,
                    $stock_uom: stock.stock_uom,
                    $current_quantity: stock.current_quantity,
                    $buy_price: stock.buy_price,
                    $sell_price: stock.sell_price
                });
            }
        }
        const { change_id } = await readLastStockChange();
        await db.closeAsync();
        await offlineUpsertLastChangeId("master_stock", change_id);
        Toast.show({
            type: "success",
            text1: `Synced stocks`,
            text2: stockIds.join(", ")
        });
    } catch (err: any) {
        Toast.show({
            type: "error",
            text1: "Failed to sync stocks",
            text2: err
        })
        console.error(err);
        throw err;
    }
}

export async function overwriteAllStock(): Promise<boolean> {
    try {
        const stock = await listStock();
        if (stock.length < 1) return false;

        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);

        const delQuery = `DELETE FROM master_stock`;
        await db.execAsync(delQuery);

        const stockMap = stock.flatMap(s => `(
            '${s.stock_id}',
            '${s.stock_description}',
            '${s.stock_uom}',
            '${s.stock_category}',
            ${s.current_quantity},
            ${s.buy_price},
            ${s.sell_price}
        )`);

        let insertQuery = `INSERT INTO master_stock (
            stock_id,
            stock_description,
            stock_uom,
            stock_category,
            current_quantity,
            buy_price,
            sell_price
        ) VALUES ` + stockMap.join(", ");

        const insertResult = await db.runAsync(insertQuery);
        await db.closeAsync();
        if (insertResult.changes > 0) {
            const { change_id: lastChangeId } = await readLastStockChange();
            await offlineUpsertLastChangeId("master_stock", lastChangeId !== undefined ? lastChangeId : 0);
            return true;
        } else {
            return false;
        }
    } catch (err) {
        throw err;
    }
};