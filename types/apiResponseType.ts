export type ApiPaginatedResponse<T extends object = any> = {
    data: T;
    metadata: {
        pageNo: number,
        pageSize: number,
        totalCount: number,
        totalPages: number,
    }
}