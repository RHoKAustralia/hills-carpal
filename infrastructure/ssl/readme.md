# Hosting Static Content on S3 using SSL

In order to get the site hosted on Amazon S3 static file hosting using SSL, we've taken these steps:

1) Created a Route53 hosted zone for carpal.org.au
- copy the name servers 'NS' value for step 2

2) Changed the domain delegation on the NetRegistry domain registrar to AWS Route53:
https://theconsole.netregistry.com.au

Old values:
ns1.netregistry.net.
ns2.netregistry.net.
ns3.netregistry.net.

3) Request a certificate in Amazon certificate manager (ACM) using DNS validation (US East Virginia region)
- allow the request process to create a validation record in Route53

4) Create a new CloudFront distribution 
- Alternate name: rides.carpal.org.au
- SSL cert: cert from (3)
- default origin: s3 bucket with static content

5) Create a CNAME to CloudFront:
- e.g. rides.carpal.org.au CNAME d1vtnhqvnkqal2.cloudfront.net

6) Add another origin for the web services 
- pass /services/... to the API gateway endpoint(s)