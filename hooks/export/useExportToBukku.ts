import {
    exportBukkuBuyers,
    exportBukkuPurchasesBill,
    exportBukkuSalesBill,
    exportBukkuSuppliers
} from "@/services/api/export/exportDataService";

export default function useExportToBukku() {
    return {
        exportBukkuSuppliers,
        exportBukkuPurchasesBill,
        exportBukkuBuyers,
        exportBukkuSalesBill
    };
};