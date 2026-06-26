type DateRange = {
    startDate: string,
    endDate: string,
};

export const exportPurchasesIntoBukkuFormat = (params?: DateRange | string[] | undefined) => {
    if (params !== undefined) {
        if (!Array.isArray(params)) {
            //Validate date range, startDate should always be earlier than endDate, swap places if false
            if (params.startDate > params.endDate) {
                const start = params.startDate;
                params.startDate = params.endDate;
                params.endDate = start;
            }
        }
    }
}