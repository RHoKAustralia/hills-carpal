## Initial Setup

### Database
The project holds sql scripts that can be used to incrementally apply changes to the database.
You can therefore also use this scripts to initialize your local database.
To run it:
```
npm run refresh-db
``` 
By default it will try to connect to a local mysql database with username `root` and password `admin`. If you want to change those configurations you can set as environment variable, for instance:
```
MYSQL_USER=myuser MYSQL_PW=myPassword MYSQL_HOST=myHost MYSQL_PORT=3316 MYSQL_DB=myDB npm run refresh-db
```

### Running the application locally

The application was designed to work with AWS lambdas. Although an *expressJs* layer was added to be able to run the application locally. To start it:

```
npm start
```
**or** to be able to debug it:
```
node ./backend/src/test/expressApis.js
```

**Attention**: The application and tests make use of the database, therefore make sure that you have your environment variables set to configure them to run against the right mysql instance. 


### Running the tests
In the `backend/` directory run:

```
npm test
```

### Deploying with serverless
Run the following in the ./infrastructure/services directory to create the API Gateway config and lambdas:
```
npm install
npm install serverless -g
serverless deploy
```

### API Gateway Custom Domain
Services are published on api.carpal.org.au.

This is achieved using:
1. An SSL certificate in North Virginia for the domain
2. A configuration in API Gateway for the custom domain as below:
![image](api-gateway-custom-doman.png)
3. A Route53 entry for api.carpal.org.au is ALIAS'd (like a hidden CNAME) to the above Target Domain Name.

Ref: https://docs.aws.amazon.com/console/apigateway/custom-domains
