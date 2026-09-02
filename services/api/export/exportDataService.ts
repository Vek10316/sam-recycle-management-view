import type { PreviewExportResponse } from "@/types/apiResponseType";
import type { BukkuContacts, BukkuPurchasesBill, BukkuSalesBill } from "@/types/previewExportType";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export type DateRange = {
    startDate: Date,
    endDate: Date,
};

const currentDate = () => (
    new Date()
)

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const previewExportBukkuSuppliers = async (dateRange?: DateRange): Promise<PreviewExportResponse<BukkuContacts> | null> => {
    const url = new URL(`${API_URL}/export/preview/bukku-suppliers`);
    if (dateRange == null) {
        Toast.show({
            type: "error",
            text1: "Suppliers: startDate and endDate must be defined"
        })
        return null;
    }
    const { startDate, endDate } = dateRange;
    url.searchParams.append("startDate", startDate.toLocaleDateString("en-CA") + " 00:00:00");
    url.searchParams.append("endDate", endDate.toLocaleDateString("en-CA") + " 23:59:59");
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = res.json();
        return errorData;
    }

    return res.json();
};

export const previewExportBukkuPurchasesBill = async (dateRange?: DateRange): Promise<PreviewExportResponse<BukkuPurchasesBill> | null> => {
    const url = new URL(`${API_URL}/export/preview/bukku-purchases-bill`);
    if (dateRange == null) {
        Toast.show({
            type: "error",
            text1: "Purchase bill: startDate and endDate must be defined"
        })
        return null;
    }
    const { startDate, endDate } = dateRange;
    url.searchParams.append("startDate", startDate.toLocaleDateString("en-CA") + " 00:00:00");
    url.searchParams.append("endDate", endDate.toLocaleDateString("en-CA") + " 23:59:59");
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = res.json();
        return errorData;
    }

    return res.json();
};

export const previewExportBukkuBuyers = async (dateRange?: DateRange): Promise<PreviewExportResponse<BukkuContacts> | null> => {
    const url = new URL(`${API_URL}/export/preview/bukku-buyers`);
    if (dateRange == null) {
        Toast.show({
            type: "error",
            text1: "Buyers: startDate and endDate must be defined"
        })
        return null;
    }
    const { startDate, endDate } = dateRange;
    url.searchParams.append("startDate", startDate.toLocaleDateString("en-CA") + " 00:00:00");
    url.searchParams.append("endDate", endDate.toLocaleDateString("en-CA") + " 23:59:59");
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorData = res.json();
        return errorData;
    }

    return res.json();
};

export const previewExportBukkuSalesBill = async (dateRange?: DateRange): Promise<PreviewExportResponse<BukkuSalesBill> | null> => {
    const url = new URL(`${API_URL}/export/preview/bukku-sales-bill`);
    if (dateRange === undefined) {
        Toast.show({
            type: "error",
            text1: "Sales bill: startDate and endDate must be defined",
        })
        return null;
    }
    const { startDate, endDate } = dateRange;
    url.searchParams.append("startDate", startDate.toLocaleDateString("en-CA") + " 00:00:00");
    url.searchParams.append("endDate", endDate.toLocaleDateString("en-CA") + " 23:59:59");
    const res = await fetch(url, {
        method: "GET"
    });

    return res.json();
};

export const exportBukkuSuppliers = async (dateRange: DateRange) => {
    const { startDate, endDate } = dateRange;

    const url = new URL(`${API_URL}/export/bukku-suppliers?startDate=${startDate.toLocaleDateString("en-CA")} 00:00:00&endDate=${endDate.toLocaleDateString("en-CA")} 23:59:59`);

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to export bukku suppliers");
    }

    const bytes = await res.bytes();
    const filename = `${currentDate().toLocaleDateString("en-CA")}-bukku-suppliers.xlsx`;

    Toast.hide();
    if (Platform.OS === "android") {
        const directory = await FileSystem.Directory.pickDirectoryAsync();

        if (!directory) {
            return;
        }

        const file = directory.createFile(
            filename,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        const handle = file.open(FileSystem.FileMode.WriteOnly);
        handle.writeBytes(bytes);
        handle.close();

        if (file.exists) {
            Toast.show({
                type: "success",
                text1: "Export successful"
            });
        }
        return file.exists;
    } else if (Platform.OS === "web") {
        const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
        Toast.show({
            type: "success",
            text1: "Export successful"
        });
        return true;
    }
};

export const exportBukkuPurchasesBill = async (dateRange: DateRange) => {
    const { startDate, endDate } = dateRange;

    const url = new URL(`${API_URL}/export/bukku-purchases-bill?startDate=${startDate.toLocaleDateString("en-CA")} 00:00:00&endDate=${endDate.toLocaleDateString("en-CA")} 23:59:59`);

    const res = await fetch(url);

    if (!res.ok) {
        console.log(url);
        throw new Error("Failed to export bukku purchases bill");
    }

    const bytes = await res.bytes();
    const filename = `${currentDate().toLocaleDateString("en-CA")}-bukku-purchases-bill.xlsx`;

    Toast.hide();
    if (Platform.OS === "android") {
        const directory = await FileSystem.Directory.pickDirectoryAsync();

        if (!directory) {
            return;
        }

        const file = directory.createFile(
            filename,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        const handle = file.open(FileSystem.FileMode.WriteOnly);
        handle.writeBytes(bytes);
        handle.close();

        if (file.exists) {
            Toast.show({
                type: "success",
                text1: "Export successful"
            });
        }
        return file.exists;
    } else if (Platform.OS === "web") {
        const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);

        Toast.show({
            type: "success",
            text1: "Export successful"
        });
        return true;
    }
};

export const exportBukkuBuyers = async (dateRange: DateRange) => {
    const { startDate, endDate } = dateRange;

    const url = new URL(`${API_URL}/export/bukku-buyers?startDate=${startDate.toLocaleDateString("en-CA")} 00:00:00&endDate=${endDate.toLocaleDateString("en-CA")} 23:59:59`);

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to export bukku buyers");
    }

    const bytes = await res.bytes();
    const filename = `${currentDate().toLocaleDateString("en-CA")}-bukku-buyers.xlsx`;

    Toast.hide();
    if (Platform.OS === "android") {
        const directory = await FileSystem.Directory.pickDirectoryAsync();

        if (!directory) {
            return;
        }

        const file = directory.createFile(
            filename,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        const handle = file.open(FileSystem.FileMode.WriteOnly);
        handle.writeBytes(bytes);
        handle.close();

        if (file.exists) {
            Toast.show({
                type: "success",
                text1: "Export successful"
            });
        }
        return file.exists;
    } else if (Platform.OS === "web") {
        const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);

        Toast.show({
            type: "success",
            text1: "Export successful"
        });
        return true;
    }
};

export const exportBukkuSalesBill = async (dateRange: DateRange) => {
    const { startDate, endDate } = dateRange;

    const url = new URL(`${API_URL}/export/bukku-sales-bill?startDate=${startDate.toLocaleDateString("en-CA")} 00:00:00&endDate=${endDate.toLocaleDateString("en-CA")} 23:59:59`);

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to export bukku sales bill");
    }

    const bytes = await res.bytes();
    const filename = `${currentDate().toLocaleDateString("en-CA")}-bukku-sales-bill.xlsx`;

    Toast.hide();
    if (Platform.OS === "android") {
        const directory = await FileSystem.Directory.pickDirectoryAsync();

        if (!directory) {
            return;
        }

        const file = directory.createFile(
            filename,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        const handle = file.open(FileSystem.FileMode.WriteOnly);
        handle.writeBytes(bytes);
        handle.close();

        if (file.exists) {
            Toast.show({
                type: "success",
                text1: "Export successful"
            });
        }
        return file.exists;
    } else if (Platform.OS === "web") {
        const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
        return true;
    }
};