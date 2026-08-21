export function shouldReloadSettings(apply: boolean, authenticatedNow: boolean, isOwner: boolean): boolean {
    return apply || (authenticatedNow && !isOwner);
}

export function shouldPreviewSettings(open: boolean, loaded: boolean): boolean {
    return open && loaded;
}
