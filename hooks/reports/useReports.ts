import reportKeys from "@/app/queries/reports.keys";
import * as service from "@/services/api/reports/reportService";
import { DateRange } from "@/types/apiResponseType";
import { useQuery } from "@tanstack/react-query";

export default function useReports(dateRange: DateRange) {
    const purchasesTotalByDateRange = useQuery({
        queryKey: [reportKeys.monthlyPurchasesTotal, dateRange],
        queryFn: () => service.readPurchasesTotalByDateRange(dateRange)
    });

    const purchasedItemsByDateRange = useQuery({
        queryKey: [reportKeys.monthlyPurchasedItems, dateRange],
        queryFn: () => service.readPurchasedItemsByDateRange(dateRange)
    });

    const salesTotalByDateRange = useQuery({
        queryKey: [reportKeys.monthlySalesTotal, dateRange],
        queryFn: () => service.readSalesTotalByDateRange(dateRange)
    });

    const soldItemsByDateRange = useQuery({
        queryKey: [reportKeys.monthlySoldItems, dateRange],
        queryFn: () => service.readSoldItemsByDateRange(dateRange)
    });

    const expensesTotalByDateRange = useQuery({
        queryKey: [reportKeys.monthlyExpensesTotal, dateRange],
        queryFn: () => service.readExpensesTotalByDateRange(dateRange)
    })

    return {
        purchasesTotalByDateRange,
        purchasedItemsByDateRange,
        salesTotalByDateRange,
        soldItemsByDateRange,
        expensesTotalByDateRange
    }
}