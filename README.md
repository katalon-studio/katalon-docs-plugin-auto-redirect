
# Docusaurus redirect link
Docusaurus Plugin to generate **client-side redirects** automatically.

This plugin will write additional HTML pages to your static site that redirect the user to your existing Docusaurus pages with JavaScript.


> PRODUCTION ONLY
> This plugin is always inactive in development and  **only active in production**  because it works on the build output.

## Configuration
|Option  | Type| Default| Description
|--|--|--|--
| s3Config| S3Config| None |S3 configuration for storing tracking url. The Configuration is required for using this plugin

## Type
S3Config
```
type S3Config = {
  accessKeyId: string; // AWS access key ID
  secretAccessKey: string; // AWS secret key
  bucket: string; // Name of the bucket to store the tracking file
  key?: string; // Name of the tracking file. Default: "document_changes"
  region?: string; // AWS region where the bucket is hosted. Default: "us-east-2"
}
```

## Example configuration
Configure this plugin in `docusaurus.config.js` as follow:
```
module.exports = {
  plugins: [
    ['plugin-auto-redirect', {
      s3Config: {
        accessKeyId: "<your access key>",
        secretAccessKey: "<your secret key>",
        bucket: "demo-bucket",
        key: "demo-file",
        region: 'us-east-2'
      }
    }]
  ]
}
```

## Notes
- For documents that have been removed (the tracking IDs are invalid), their records will still be kept in the tracking file.
- Records of removed documents will have the property `removed: true` and will be put at the end of the tracking file.
- Redirects of removed documents won't be applied in order to avoid redirecting to invalid paths. If the paths are still valid (e.g. paths are being used for other documents), please update the tracking file manually.
