export interface DocumentData {
    id: string;
    slug: string;
    title: string | null;
    contentHtml: string;
    yjsStateBase64: string | null;
    updatedAt: string;
    createdAt: string;
}

export interface PresenceUser {
    id: string;
    name: string;
    color: string;
}

export interface SaveResponse {
    success: boolean;
    updatedAt?: string;
    error?: string;
}
