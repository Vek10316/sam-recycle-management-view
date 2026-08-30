export type ApiPaginatedResponse<T extends object = any> = {
    data: T;
    metadata: {
        pageNo: number,
        pageSize: number,
        totalCount: number,
        totalPages: number,
    }
};

export type DateRange = {
    startDate: Date,
    endDate: Date
};

export type PreviewExportResponse<T extends object = any> = {
    headers: Object,
    data: T[],
    totalCount: number
};