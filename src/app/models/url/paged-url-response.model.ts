export interface UrlListItem {
    originalUrl: string;
    shortCode: string;
    clickCount: number;
    createdAt: string;
    expiresAt: string | null;
}

export interface PagedUrlResponse {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    items: UrlListItem[];
}