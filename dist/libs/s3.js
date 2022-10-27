"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
class S3Lib {
    client;
    constructor({ region, accessKeyId, secretAccessKey }) {
        this.client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    getInstance() {
        return this.client;
    }
}
exports.default = S3Lib;
