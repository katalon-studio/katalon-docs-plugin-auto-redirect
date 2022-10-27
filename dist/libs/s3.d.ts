import { S3Client } from "@aws-sdk/client-s3";
import { StorageLib } from "../types";
interface S3ClientConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}
export default class S3Lib implements StorageLib<S3Client> {
    client: S3Client;
    constructor({ region, accessKeyId, secretAccessKey }: S3ClientConfig);
    getInstance(): S3Client;
}
export {};
