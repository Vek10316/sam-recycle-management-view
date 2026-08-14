import * as SQLite from "expo-sqlite";

export async function initDatabase() {
    const db = await SQLite.openDatabaseAsync("stock-view.db");

    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS suppliers (
            supplier_id TEXT PRIMARY KEY NOT NULL,
            supplier_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS buyers (
            buyer_id TEXT PRIMARY KEY NOT NULL,
            buyer_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS purchases (
            transact_id INTEGER PRIMARY KEY NOT NULL,
            supplier_id TEXT,
            transact_date TEXT NOT NULL,
            transact_total_amount REAL NOT NULL,
            transact_status TEXT NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        );

        CREATE TABLE IF NOT EXISTS purchases_details (
            detail_id INTEGER PRIMARY KEY NOT NULL,
            transact_id INTEGER NOT NULL,
            stock_id INTEGER NOT NULL,
            item_quantity REAL NOT NULL,
            item_price REAL NOT NULL,
            transact_subtotal REAL NOT NULL,
            FOREIGN KEY (transact_id) REFERENCES purchases(transact_id)
        );

        CREATE TABLE IF NOT EXISTS sales (
            transact_id INTEGER PRIMARY KEY NOT NULL,
            buyer_id TEXT,
            transact_date TEXT NOT NULL,
            transact_total_amount REAL NOT NULL,
            transact_status TEXT NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (buyer_id) REFERENCES buyers(buyer_id)
        );

        CREATE TABLE IF NOT EXISTS sales_details (
            detail_id INTEGER PRIMARY KEY NOT NULL,
            transact_id INTEGER NOT NULL,
            stock_id INTEGER NOT NULL,
            item_quantity REAL NOT NULL,
            item_price REAL NOT NULL,
            transact_subtotal REAL NOT NULL,
            FOREIGN KEY (transact_id) REFERENCES sales(transact_id)
        );

        CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    `);

    return db;
}