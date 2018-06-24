# Hills CarPal Site Security Design

## Principles
### Least Privelege
Throughout the site each component or layer is provided the least priveleges required to perform its tasks.

### Single-Purpose Components
Each component within the system is responsible for only one function. This is important to security because it allows for these single-purpose components to be allocated permissions only to the extent required. 

As an example, the Lambda function which reads information from a certain database table is only given credentials allowing for this. This protects the system from both malicious and accidental damage.


## Components
### Authentication + Authorization
An external component for authentication and authorization will be delegated to Auth0:

Auth0 Service: https://auth0.com

Authentication and authorization will be managed using JSON Web Token (JWT) based sessions. These session tokens may only generated externally to the application using the private key held securely in Auth0. The public key is open and can be used to verify that the token is a CarPal genuine session. 

Within the JSON data of the token are the roles of the logged in user. 

### UI
The UI is a React single-page application (SPA) which is hosted in S3 static file server in a bucket (folder).
CloudFront uses the S3 bucket as the origin of the default path to the website.
The S3 bucket uses a policy which allows only the CloudFront distribution to serve it's content.

Ref: [CloudFront Restricted S3 Content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

The UI is aware of the JWT session token, and reads the roles within to control which UI elements are shown to which user. In addition the UI passes the JWT to the API on every request in an Authorization: Bearer ... header.

### API
The API of CarPal is protected using a custom authorizer lambda function which validates the JSON Web Token (JWT) of the user's session. 

In addition to proving that the user has a valid session, the JWT contains a list of roles assigned to the user. Only users with appropriate roles will be allowed to access the system.

These roles are used by API Gateway custom authorizer to verify that the user has access:
- to the API in general
- to the method being invoked
- and to the data being requested

#### API Network
The API is public, hosted on its own domain and its own CloudFront distribution.

The Lambda backing the API runs within the private VPC network.

Because the API Lambda executes within the private network, it is able to communicate with the database via its private IP address.

The Serverless configuration dynamically sets a range of subnets in which the Lambda container can run (one in each availability zone), and a security group that allows inbound 443 only and outbound any.

```
provider:
  name: aws
  vpc:
    securityGroupIds:
      - sg-a123abcd
    subnetIds:
      - subnetId1
      - subnetId2
      - subnetId3
```
Ref: 
https://serverless.com/framework/docs/providers/aws/guide/functions/#vpc-configuration

### Data Layer
The Hills CarPal data layer is MySQL based, using Amazon RDS to host a MySQL 5.7 instance.

The database is required to be accessed by:
- The API over a MySQL connection, using read/write username/password credentials
- Database Administrators over a MySQL connection, using administrative username/password credentials
- Infrastructure Administrators to create/update RDS configurations in the AWS console using an IAM role

#### Data Layer Network
The database and any other related data components are protected in the following ways:
- Obscurity
  - The port number is a random port and not advertised outside of the solution
  - The port number is not checked into source code
- Restricted Access
  - An internet gateway allows access in only for certain IP ranges (through security group restrictions) of:
    - Lambda hosting VPC subnets;
      and
    - well known remote administrators public IP addresses

##### FUTURE UPGRADE
When possible an upgrade to the Data Layer Network will be made in the following areas:
- The database will be moved onto a private subnet within the virtual private cloud (VPC) for the environment. Using network access control lists (ACLs) only the random MySQL port will be allowed into this subnet and only ephemeral ports out.
- A VPN will allow access to this private subnet for administrators 

This upgrade relies on some back office infrastructure within the CarPal charity and will be completed when appropriate.

## Secrets
All secrets (passwords, API keys) are excluded from source control and from packaged deployment bundles.

These secrets will be securely kept in build systems with encryption.

##### FUTURE UPGRADE
Ideal is to use a key management system (KMS) to keep these secrets encrypted at rest and only have them decrpyted at invocation time.

As an example, the password for Lambda to access the MySQL database would be kept in an encrypted environment variable in the Lambda settings and decrypted by Amazon prior to executing the Lambda.

Ref: http://www.goingserverless.com/blog/keeping-secrets-out-of-git
Ref: https://docs.aws.amazon.com/lambda/latest/dg/env_variables.html#env_encrypt

# References

AWS Serverless Architecture Whitepaper
https://d1.awsstatic.com/whitepapers/serverless-architectures-with-aws-lambda.pdf
