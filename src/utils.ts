import { PluginOptions, RedirectRule, S3Config, DocumentUrlHistory } from './types';
require('dotenv').config();

export function getS3Config({ s3Config }: PluginOptions): S3Config {
  const { accessKeyId, secretAccessKey, bucket, key, region } = s3Config || {};

  return {
    accessKeyId: accessKeyId || process.env.ACCESSKEYID!,
    secretAccessKey: secretAccessKey || process.env.SECRETACCESSKEY!,
    bucket: bucket || process.env.BUCKET!,
    key: key ? `${key}.json` : (process.env.KEY ? `${process.env.KEY}.json` :'document_changes.json'),
    region: region || (process.env.REGION || 'us-east-2'),
  }
}

export function getRedirectRules(historyItems: DocumentUrlHistory[]): RedirectRule[] {
  return historyItems.filter((history) => history.from.length && !history.removed).map(({ from, to }) => ({ from, to }));
}
