export interface SeoMetadata {
    title: string;
    description: string;
    canonicalUrl: string;
    imageUrl: string;
    imageAlt: string;
    imageWidth: number;
    imageHeight: number;
    imageType: string;
    locale: string;
    robots: string;
    siteName: string;
    themeColor: string;
    type: string;
    sitemapUrl: string;
    structuredData: Record<string, unknown> | null;
}
