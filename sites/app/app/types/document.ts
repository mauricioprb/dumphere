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

export interface DocumentTreeNode {
    slug: string;
    label: string;
    hasChildren: boolean;
    exists: boolean;
}

export interface DocumentTreeResponse {
    children: DocumentTreeNode[];
}

export interface AddressTheme {
    themeHue: number | null;
    themeChroma: number | null;
    themeHueDark: number | null;
    themeChromaDark: number | null;
}

export interface OpenedDocument extends AddressTheme {
    status: 'ok';
    document: DocumentData;
    wsToken: string;
    readonly: boolean;
    reserved: boolean;
    maxDocuments: number;
    isOwner: boolean;
    readonlyForVisitors: boolean;
    lockedForVisitors: boolean;
}

export interface LockedDocument extends AddressTheme {
    status: 'locked';
    slug: string;
}
