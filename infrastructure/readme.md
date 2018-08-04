# Infrastructure Overview

The CarPal infrastructure is based on the following Amazon Web Services (AWS):
- CloudFront content distribution
- [Serverless APIs](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/) (API Gateway + Lambda)
- MySQL relational database service (RDS)

In addition authentication is based on Auth0 and JSON Web Tokens (JWTs).
