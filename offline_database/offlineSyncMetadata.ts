import type { OfflineSyncMetadata } from "@/types/offlineSyncMetadataType";
import * as SQLite from "expo-sqlite";
import { getDbName } from "./offlineDatabase";

const DB_NAME = await getDbName();

export default async function offlineReadSyncMetadata() {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `SELECT * FROM sync_metadata`;
        const result = await db.getAllAsync<OfflineSyncMetadata>(query);
        return result;
    } catch (err) {
        console.error(`Failed to read table (sync_metadata): ${err}`);
        return;
    }
};

export async function offlineUpdateLatestChangeId(table_name: string, latest_change_id: number) {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        const query = `UPDATE sync_metadata SET latest_change_id = $latest_change_id WHERE table_name = $table_name`;
        const result = await db.runAsync(query, {
            $table_name: table_name,
            $latest_change_id: latest_change_id
        });
        return result.changes > 0;
    } catch (err) {
        throw err;
    }
}