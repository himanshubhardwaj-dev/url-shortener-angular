export interface CreateShortUrlRequest {
    originalUrl: string;
    expiresAt: string | null;
    customShortCode: string | null;
}
export interface CreateShortUrlResponse {
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    createdAt: string;
    expiresAt: string | null;
}