let isOnline = false;

export const apiStatus = {
    get isOnline() {
        return isOnline;
    },

    setOnline() {
        isOnline = true;
    },

    setOffline() {
        isOnline = false;
    },
};