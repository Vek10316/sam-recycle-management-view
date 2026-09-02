import previewBukkuExportsKeys from "@/app/queries/previewBukkuExports.keys";
import type { DateRange } from "@/services/api/export/exportDataService";
import * as exportService from "@/services/api/export/exportDataService";
import { useQuery } from "@tanstack/react-query";

export default function usePreviewExportToBukku(dateRange: DateRange | undefined) {
    const previewBukkuPurchasesBill = useQuery({
        queryKey: [previewBukkuExportsKeys.purchases_bill, dateRange],
        queryFn: () => exportService.previewExportBukkuPurchasesBill(dateRange),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const previewBukkuSuppliers = useQuery({
        queryKey: [previewBukkuExportsKeys.suppliers, dateRange],
        queryFn: () => exportService.previewExportBukkuSuppliers(dateRange),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const previewBukkuSalesBill = useQuery({
        queryKey: [previewBukkuExportsKeys.sales_bill, dateRange],
        queryFn: () => exportService.previewExportBukkuSalesBill(dateRange),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const previewBukkuBuyers = useQuery({
        queryKey: [previewBukkuExportsKeys.buyers, dateRange],
        queryFn: () => exportService.previewExportBukkuBuyers(dateRange),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    return {
        previewBukkuPurchasesBill,
        previewBukkuSuppliers,
        previewBukkuSalesBill,
        previewBukkuBuyers
    }
};