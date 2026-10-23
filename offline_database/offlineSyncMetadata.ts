import type { OfflineSyncMetadata } from "@/types/offlineSyncMetadataType";
import * as SQLite from "expo-sqlite";
import { getDbName } from "./offlineDatabase";

export async function offlineReadSyncMetadata() {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM sync_metadata`;
        const result = await db.getAllAsync<OfflineSyncMetadata>(query);
        await db.closeAsync();
        return result;
    } catch (err) {
        console.error(`Failed to read table (sync_metadata): ${err}`);
        return;
    }
};

export async function offlineUpsertLastChangeId(table_name: string, last_change_id: number) {
    try {
        const DB_NAME = await getDbName();
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const exists = await db.getFirstAsync(`SELECT * FROM sync_metadata WHERE table_name = $table_name`, {
            $table_name: table_name
        });
        const query = exists ?
            `UPDATE sync_metadata SET last_change_id = $last_change_id WHERE table_name = $table_name` :
            `INSERT INTO sync_metadata (table_name, last_change_id) VALUES ($table_name, $last_change_id)`;
        const result = await db.runAsync(query, {
            $table_name: table_name,
            $last_change_id: last_change_id
        });
        await db.closeAsync();
        return result.changes > 0;
    } catch (err) {
        throw err;
    }
}