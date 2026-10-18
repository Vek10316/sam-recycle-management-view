import * as SQLite from "expo-sqlite";

let openedDatabase: SQLite.SQLiteDatabase | null = null;

export const offlineDatabaseStatus = {
    get getOpenedDatabase() {
        return openedDatabase;
    },

    async setOpenedDatabaseAsync(db: SQLite.SQLiteDatabase) {
        openedDatabase = await offlineOpenDatabaseAsync();
    },

    clearOpenedDatabase() {
        openedDatabase = null;
    }
};

export const offlineOpenDatabaseAsync = async () => {
    const DB_NAME = process.env.OFFLINE_DB_NAME;
    if (DB_NAME == null) {
        throw "Environment variable not set: OFFLINE_DB_NAME";
    };
    if (openedDatabase != null) {
        return openedDatabase;
    };
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        return db;
    } catch (err: any) {
        throw err;
    }
};

export const offlineGetDBName = async (): Promise<string> => {
    const DB_NAME = process.env.OFFLINE_DB_NAME;
    if (DB_NAME == null) throw "Environment variable not set: OFFLINE_DB_NAME";
    return DB_NAME;
};