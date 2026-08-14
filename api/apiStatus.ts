let online = false;

export const apiStatus = {
    get online() {
        return online;
    },

    setOnline() {
        online = true;
    },

    setOffline() {
        online = false;
    },
};