export interface RegisterResponse {
    access_token: string;
    user: {
        username: string;
        email: string;
        role: string;
        organizationId?: string
    };
}
