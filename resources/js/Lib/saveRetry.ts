const RETRYABLE_CLIENT_STATUSES = [408, 429];

export function isPermanentSaveRejection(status: number): boolean {
    return status >= 400 && status < 500 && !RETRYABLE_CLIENT_STATUSES.includes(status);
}
