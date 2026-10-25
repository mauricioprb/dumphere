import { Client, ExecutionMethod, Functions } from 'appwrite';

export interface ApiResponse<T> {
    status: number;
    data: T;
}

export interface ApiFailure {
    error: string;
    retryAfter?: number;
    prefix?: string;
    requestId?: string;
}

let functions: Functions | undefined;

export function useAppwrite() {
    if (!functions) {
        const { public: config } = useRuntimeConfig();

        functions = new Functions(
            new Client().setEndpoint(config.appwriteEndpoint).setProject(config.appwriteProjectId),
        );
    }

    return functions;
}

export async function callDocuments<T>(path: string, body: object): Promise<ApiResponse<T>> {
    const execution = await useAppwrite().createExecution({
        functionId: 'documents',
        body: JSON.stringify(body),
        async: false,
        xpath: path,
        method: ExecutionMethod.POST,
        headers: { 'content-type': 'application/json' },
    });

    return {
        status: execution.responseStatusCode,
        data: JSON.parse(execution.responseBody || 'null') as T,
    };
}

const ownerTokenKey = (prefix: string) => `dumphere:owner:${prefix}`;

export function readOwnerToken(prefix: string): string | null {
    try {
        return localStorage.getItem(ownerTokenKey(prefix));
    } catch {
        return null;
    }
}

export function storeOwnerToken(prefix: string, token: string | null): void {
    try {
        if (token) localStorage.setItem(ownerTokenKey(prefix), token);
        else localStorage.removeItem(ownerTokenKey(prefix));
    } catch {
        return;
    }
}

export function sendDocumentsBeacon(path: string, body: object): void {
    const { public: config } = useRuntimeConfig();

    fetch(`${config.appwriteEndpoint}/functions/documents/executions`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-appwrite-project': config.appwriteProjectId,
        },
        body: JSON.stringify({
            body: JSON.stringify(body),
            async: true,
            path,
            method: 'POST',
            headers: { 'content-type': 'application/json' },
        }),
        keepalive: true,
    }).catch(() => {});
}
