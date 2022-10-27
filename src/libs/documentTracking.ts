import { DocumentMetaData, DocumentUrlHistory, StorageLib, S3Config, DocusaurusGlobalData } from '../types';
import fs from 'fs';
import path from 'path';
import S3Lib from './s3';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';
import lodash from 'lodash/fp';

export default class AWSDocumentTrackingLib {
  s3Config: S3Config;
  storageInstance: StorageLib<S3Client>;

  constructor(s3Config: S3Config) {
    const { region, accessKeyId, secretAccessKey } = s3Config;

    this.s3Config = s3Config;
    this.storageInstance = new S3Lib({
      region,
      accessKeyId,
      secretAccessKey,
    });
  }

  async trackChanges(dirName: string): Promise<DocumentUrlHistory[]> {
    const documentsMetaData: DocumentMetaData[] =
      this.getCurrentFileMetaData(dirName);

    // load from S3Lib
    const instance = this.storageInstance.getInstance();
    const fileUrlChanges = await this.detectDocumentChanges(
      instance,
      documentsMetaData
    );
    const bucketParams = {
      Bucket: this.s3Config.bucket,
      Key: this.s3Config.key,
      Body: JSON.stringify(fileUrlChanges),
    };
    await instance.send(new PutObjectCommand(bucketParams));
    return fileUrlChanges;
  }

  private async detectDocumentChanges(
    instance: S3Client,
    documentsMetaData: DocumentMetaData[]
  ): Promise<DocumentUrlHistory[]> {
    let fileContent = '[]';
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: this.s3Config.key,
    });

    try {
      const getFilesTask = await instance.send(getObjectCommand);
      fileContent = (await getFilesTask.Body?.transformToString()) || '[]';
    } catch (err) {
      // Catch the error and continue if it is "NoSuchKey" (file does not exist)
      // Re-throw the error otherwise
      if (!(err instanceof NoSuchKey)) {
        throw err;
      }
    }

    let trackingFiles: DocumentUrlHistory[] = [];
    const remoteTrackingFiles: DocumentUrlHistory[] = JSON.parse(fileContent);

    // Compare the changes
    if (!lodash.isEmpty(remoteTrackingFiles)) {
      trackingFiles = documentsMetaData.map((item) => {
        const remoteFile = lodash.find<DocumentUrlHistory>(
          (remoteItem) => remoteItem.id === item.id
        )(remoteTrackingFiles);

        if (!lodash.isNil(remoteFile)) {
          if (item.permalink !== remoteFile.to) {
            const currentPaths = documentsMetaData.map((item) => item.permalink);

            // Only redirect if URL is no longer valid
            if (!currentPaths.includes(remoteFile.to)) {
              remoteFile.from.push(remoteFile.to);
            }
            remoteFile.to = item.permalink;
          }
          return remoteFile;
        }
        return { id: item.id, from: [], to: item.permalink };
      });
    } else {
      trackingFiles = documentsMetaData.map((item) => {
        return {
          id: item.id,
          from: [],
          to: item.permalink,
        };
      });
    }

    return trackingFiles;
  }

  // Get Current docusaurus meta-data files
  private getCurrentFileMetaData(dirName: string) {
    const result: DocumentMetaData[] = [];
    fs.readdir(dirName, function (err, filenames) {
      if (err) {
        console.error(err);
        return;
      }

      const globalData: DocusaurusGlobalData = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../../../.docusaurus/globalData.json'), { encoding: 'utf-8' })
      );
      const allVersions = globalData['docusaurus-plugin-content-docs'].default.versions;
      const docPaths = allVersions.map(({ docs }) => docs.map(({ path }) => path)).flat();

      filenames.forEach(function (filename) {
        var filePath = path.join(dirName, filename);
        fs.readFile(filePath, 'utf-8', function (err, content) {
          if (err) {
            console.error(err);
            return;
          }

          const fileMetaData: DocumentMetaData = JSON.parse(content);
          
          // ignore files whose URL does not valid
          if (fileMetaData.permalink && docPaths.includes(fileMetaData.permalink)) {
            result.push(fileMetaData);
          }
        });
      });
    });
    return result;
  }
}
