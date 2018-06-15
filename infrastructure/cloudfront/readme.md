# Single Page App config in CloudFront

CloudFront presents an S3 bucket containing the React website.

The benefits in using CloudFront are:
- CloudFront can present a custom domain (with SSL) for the origin
- CloudFront can have a special error page for 404 errors redirecting all / paths to index.html, meaning proper push-state path routing can be used without needing a web server

