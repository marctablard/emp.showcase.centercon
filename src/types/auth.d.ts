export interface Session {
    sessionId: string;
    customerId?: string;
    expiresAt: number;
    currency?: string;
    country?: string;
}

export interface SessionCookie {
    [siteCode: string]: Session[];
}