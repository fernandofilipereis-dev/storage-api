export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface FilterParams {
    search?: string;
    isActive?: boolean;
}

export interface ListParams extends PaginationParams, SortParams, FilterParams { }

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
