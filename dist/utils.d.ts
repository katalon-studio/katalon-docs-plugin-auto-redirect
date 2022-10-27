import { PluginOptions, RedirectRule, S3Config, DocumentUrlHistory } from './types';
export declare function getS3Config({ s3Config }: PluginOptions): S3Config;
export declare function getRedirectRules(historyItems: DocumentUrlHistory[]): RedirectRule[];
