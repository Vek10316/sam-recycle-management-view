import type { PreviewExportResponse } from "@/types/apiResponseType";
import type { BukkuContacts, BukkuPurchasesBill, BukkuSalesBill } from "@/types/previewExportType";
import Toast from "react-native-toast-message";

export type DateRange = {
    startDate: Date,
    endDate: Date,
};

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