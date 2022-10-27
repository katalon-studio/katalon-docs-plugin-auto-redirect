"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const s3_1 = __importDefault(require("./s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const fp_1 = __importDefault(require("lodash/fp"));
class AWSDocumentTrackingLib {
    s3Config;
    storageInstance;
    constructor(s3Config) {
        const { region, accessKeyId, secretAccessKey } = s3Config;
        this.s3Config = s3Config;
        this.storageInstance = new s3_1.default({
            region,
            accessKeyId,
            secretAccessKey,
        });
    }
    async trackChanges(dirName) {
        const documentsMetaData = this.getCurrentFileMetaData(dirName);
        const instance = this.storageInstance.getInstance();
        const fileUrlChanges = await this.detectDocumentChanges(instance, documentsMetaData);
        const bucketParams = {
            Bucket: this.s3Config.bucket,
            Key: this.s3Config.key,
            Body: JSON.stringify(fileUrlChanges),
        };
        await instance.send(new client_s3_1.PutObjectCommand(bucketParams));
        return fileUrlChanges;
    }
    async detectDocumentChanges(instance, documentsMetaData) {
        let fileContent = '[]';
        const getObjectCommand = new client_s3_1.GetObjectCommand({
            Bucket: this.s3Config.bucket,
            Key: this.s3Config.key,
        });
        try {
            const getFilesTask = await instance.send(getObjectCommand);
            fileContent = (await getFilesTask.Body?.transformToString()) || '[]';
        }
        catch (err) {
            if (!(err instanceof client_s3_1.NoSuchKey)) {
                throw err;
            }
        }
        let trackingFiles = [];
        const remoteTrackingFiles = JSON.parse(fileContent);
        if (!fp_1.default.isEmpty(remoteTrackingFiles)) {
            trackingFiles = documentsMetaData.map((item) => {
                const remoteFile = fp_1.default.find((remoteItem) => remoteItem.id === item.id)(remoteTrackingFiles);
                if (!fp_1.default.isNil(remoteFile)) {
                    if (item.permalink !== remoteFile.to) {
                        const currentPaths = documentsMetaData.map((item) => item.permalink);
                        if (!currentPaths.includes(remoteFile.to)) {
                            remoteFile.from.push(remoteFile.to);
                        }
                        remoteFile.to = item.permalink;
                    }
                    return remoteFile;
                }
                return { id: item.id, from: [], to: item.permalink };
            });
        }
        else {
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
    getCurrentFileMetaData(dirName) {
        const result = [];
        fs_1.default.readdir(dirName, function (err, filenames) {
            if (err) {
                console.error(err);
                return;
            }
            const globalData = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../../../.docusaurus/globalData.json'), { encoding: 'utf-8' }));
            const allVersions = globalData['docusaurus-plugin-content-docs'].default.versions;
            const docPaths = allVersions.map(({ docs }) => docs.map(({ path }) => path)).flat();
            filenames.forEach(function (filename) {
                var filePath = path_1.default.join(dirName, filename);
                fs_1.default.readFile(filePath, 'utf-8', function (err, content) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const fileMetaData = JSON.parse(content);
                    if (fileMetaData.permalink && docPaths.includes(fileMetaData.permalink)) {
                        result.push(fileMetaData);
                    }
                });
            });
        });
        return result;
    }
}
exports.default = AWSDocumentTrackingLib;
