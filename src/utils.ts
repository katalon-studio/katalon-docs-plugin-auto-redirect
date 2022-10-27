import { PluginOptions, RedirectRule, S3Config, DocumentUrlHistory } from './types';

export function getS3Config({ s3Config }: PluginOptions): S3Config {
  const { accessKeyId, secretAccessKey, bucket, key, region } = s3Config;

  return {
    accessKeyId,
    secretAccessKey,
    bucket,
    key: key ? `${key}.json` : 'document_changes.json',
    region: region || 'us-east-2',
  }
}

export function getRedirectRules(historyItems: DocumentUrlHistory[]): RedirectRule[] {
  return historyItems.filter((history) => history.from.length).map(({ from, to }) => ({ from, to }));
}
