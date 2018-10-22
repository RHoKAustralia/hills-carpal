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

You might end up with an error "Client does not support authentication protocol" - to fix refer to https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server.

### Running the application locally

The application was designed to work with AWS lambdas. Although an *expressJs* layer was added to be able to run the application locally. To start it:

```
npm start
```
**or** to be able to debug it:
```
node ./backend/src/test/expressApis.js
```

#### Using Docker for the local db

To make this easier if you've got docker installed you can use that for the local db:

```
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d mysql:5.7
yarn run refresh-db
```

**Attention**: The application and tests make use of the database, therefore make sure that you have your environment variables set to configure them to run against the right mysql instance. 

#### Bypassing login locally
Run with environment variables `UNSAFE_GOD_MODE=true` locally to make yourself an admin, driver and facilitator.

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
