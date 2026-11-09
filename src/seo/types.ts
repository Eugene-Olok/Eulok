export interface SchemaOrgGraph {
  '@context': string;
  '@graph': Array<Record<string, unknown>>;
}

export interface PageSEOConfig {
  pageId: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogType: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard: 'summary_large_image' | 'summary';
  robots?: string;
  structuredData: SchemaOrgGraph | Record<string, unknown>;
}
