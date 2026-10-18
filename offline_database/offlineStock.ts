import {
    readLatestStockChange
} from "@/services/api/stock/stockService";
import type * as StockTypes from "@/types/stockType";
import * as SQLite from "expo-sqlite";
import { getDbName } from "./offlineDatabase";
import offlineReadSyncMetadata from "./offlineSyncMetadata";

const DB_NAME = await getDbName();

export async function offlineReadStock() {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM master_stock`;
        const result = await db.getAllAsync<StockTypes.Stock>(query);
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineReadStockCategories() {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT DISTINCT stock_category FROM master_stock`;
        const result = await db.getAllAsync<Pick<StockTypes.Stock, "stock_category">>(query);
        return result.flatMap(r => r.stock_category);
    } catch (err) {
        throw err;
    }
};

export async function offlineReadStockById(id: string) {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM master_stock WHERE stock_id = ${id}`;
        const result = await db.getFirstAsync<StockTypes.Stock>(query);
        return result;
    } catch (err) {
        throw err;
    }
};

export async function offlineMasterStockIsOutdated() {
    try {
        const { change_id } = await readLatestStockChange();
        const syncMetadata = await offlineReadSyncMetadata();
        const offlineLatest = syncMetadata?.find(s => s.table_name === "master_stock");
        if (offlineLatest !== undefined && offlineLatest.latest_change_id >= change_id) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        throw err;
    }
};

export async function offlineMasterStockSync(latest_change_id: number) {
    try {
        
    } catch (err) {
        throw err;
    }
};