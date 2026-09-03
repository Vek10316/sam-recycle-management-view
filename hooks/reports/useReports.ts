import reportKeys from "@/app/queries/reports.keys";
import * as service from "@/services/api/reports/reportService";
import { DateRange } from "@/types/apiResponseType";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useReports(dateRange: DateRange) {
    const queryClient = useQueryClient();

    const purchasesTotalByDateRange = useQuery({
        queryKey: reportKeys.monthlyPurchasesTotal,
        queryFn: () => service.readPurchasesTotalByDateRange(dateRange)
    });

    const purchasedItemsByDateRange = useQuery({
        queryKey: reportKeys.monthlyPurchasedItems,
        queryFn: () => service.readPurchasedItemsByDateRange(dateRange)
    });

    const salesTotalByDateRange = useQuery({
        queryKey: reportKeys.monthlySalesTotal,
        queryFn: () => service.readSalesTotalByDateRange(dateRange)
    });

    const soldItemsByDateRange = useQuery({
        queryKey: reportKeys.monthlySoldItems,
        queryFn: () => service.readSoldItemsByDateRange(dateRange)
    });

    const expensesTotalByDateRange = useQuery({
        queryKey: reportKeys.monthlyExpensesTotal,
        queryFn: () => service.readExpensesTotalByDateRange(dateRange)
    });

    useEffect(() => {
        if (dateRange.startDate !== undefined && dateRange.endDate !== undefined) {
            queryClient.invalidateQueries({
                queryKey: reportKeys.monthlyPurchasesTotal
            });
            queryClient.invalidateQueries({
                queryKey: reportKeys.monthlyPurchasedItems
            });
            queryClient.invalidateQueries({
                queryKey: reportKeys.monthlySalesTotal
            });
            queryClient.invalidateQueries({
                queryKey: reportKeys.monthlySoldItems
            });
            queryClient.invalidateQueries({
                queryKey: reportKeys.monthlyExpensesTotal
            });
        }
    }, [dateRange])

    return {
        purchasesTotalByDateRange,
        purchasedItemsByDateRange,
        salesTotalByDateRange,
        soldItemsByDateRange,
        expensesTotalByDateRange
    }
}