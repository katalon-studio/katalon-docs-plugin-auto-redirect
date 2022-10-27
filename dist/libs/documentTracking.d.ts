import { DocumentUrlHistory, StorageLib, S3Config } from '../types';
import { S3Client } from '@aws-sdk/client-s3';
export default class AWSDocumentTrackingLib {
    s3Config: S3Config;
    storageInstance: StorageLib<S3Client>;
    constructor(s3Config: S3Config);
    trackChanges(dirName: string): Promise<DocumentUrlHistory[]>;
    private detectDocumentChanges;
    private getCurrentFileMetaData;
}
