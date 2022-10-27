
# Docusaurus redirect link
Docusaurus Plugin to generate **client-side redirects** automatically.

This plugin will write additional HTML pages to your static site that redirect the user to your existing Docusaurus pages with JavaScript.


> PRODUCTION ONLY
> This plugin is always inactive in development and  **only active in production**  because it works on the build output.

## Configuration
|Option  | Type| Default| Description
|--|--|--|--
| s3Config| S3Config| Undefined |S3 configuration for storing tracking url. The Configuration is required for using this plugin

## Type
S3Config

    type S3Config = {
	    accessKeyId: string; // aws access key id
	    secretAccessKey: string; // aws secret key
	    bucket: string; // bucket name
	    key: string; // filename 
	}

## Example configuration

    module.exports = {
	    plugins = [
	      ['plugin-auto-redirect'], {
		      s3Config: {
			    accessKeyId: "",
			    secretAccessKey: "",
			    bucket: "demoApp",
			    key: "demoApp"
		      }
	      }
	    ]
    }
