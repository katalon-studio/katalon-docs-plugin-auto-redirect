"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedirectRules = exports.getS3Config = void 0;
function getS3Config({ s3Config }) {
    const { accessKeyId, secretAccessKey, bucket, key, region } = s3Config;
    return {
        accessKeyId,
        secretAccessKey,
        bucket,
        key: key ? `${key}.json` : 'document_changes.json',
        region: region || 'us-east-2',
    };
}
exports.getS3Config = getS3Config;
function getRedirectRules(historyItems) {
    return historyItems.filter((history) => history.from.length && !history.removed).map(({ from, to }) => ({ from, to }));
}
exports.getRedirectRules = getRedirectRules;
