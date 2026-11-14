import type { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 1;
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    let currentDbVersion = result?.user_version ?? 0;
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }
    if (currentDbVersion === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            
            CREATE TABLE IF NOT EXISTS purchases_transactions (
                transact_id INTEGER PRIMARY KEY NOT NULL,
                supplier_id TEXT NOT NULL,
                transact_address TEXT NOT NULL,
                transact_date TEXT NOT NULL,
                transact_total_amount REAL NOT NULL,
                transact_status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS purchases_transactions_details (
                detail_id INTEGER PRIMARY KEY NOT NULL,
                transact_id INTEGER NOT NULL,
                stock_id TEXT NOT NULL,
                item_quantity REAL NOT NULL,
                item_price REAL NOT NULL,
                transact_subtotal REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sales_transactions (
                transact_id INTEGER PRIMARY KEY NOT NULL,
                buyer_id TEXT NOT NULL,
                transact_address TEXT NOT NULL,
                transact_date TEXT NOT NULL,
                transact_total_amount REAL NOT NULL,
                transact_status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sales_transactions_details (
                detail_id INTEGER PRIMARY KEY NOT NULL,
                transact_id INTEGER NOT NULL,
                stock_id TEXT NOT NULL,
                item_quantity REAL NOT NULL,
                item_price REAL NOT NULL,
                transact_subtotal REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS master_stock (
                stock_id TEXT NOT NULL,
                stock_description TEXT NOT NULL,
                stock_uom TEXT NOT NULL,
                stock_category TEXT,
                current_quantity REAL NOT NULL,
                buy_price REAL NOT NULL,
                sell_price REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sync_metadata (
                table_name TEXT PRIMARY KEY NOT NULL,
                last_change_id INTEGER NOT NULL DEFAULT 0
            );
        `);
        currentDbVersion = 1;
    };
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};

export async function getDbName() {
    return process.env.OFFLINE_DB_NAME ?? "stock-view.db";
};