export interface LoginResponse {
    token: string;
    expireAt: string;
    userId: string;
    email: string;
    role: string;
}