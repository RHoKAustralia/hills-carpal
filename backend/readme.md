## Initial Setup

The steps to getting started are:
1. Install mySQL or use a docker container
2. Use a nodeJS package manager (yarn or npm) to build project packages and dependencies 
3. Create carpal db using included script  (see ./backend/package.json)
4. Populate capal db using script 
5. Run dev script to start the ExpressJS server


### Backend Overview

This app uses the mySQL database. There are some scripts that can be used to create and incrementally apply changes to the database. (see ./backend/migrations/sqls/)

A helpful SQL/JavaScript middleware called db-migrate (https://db-migrate.readthedocs.io/en/latest/Getting%20Started/configuration/) is configured to use these scripts. (see /backend/database.json).

This app is built to be "serverless" using AWS λambda and AWS API Gateway. For local development, an expressJS HTTP server called serverless-offline (see /backend/serverless.yml) (https://www.npmjs.com/package/serverless-offline) handles the client requests and routes them to the RESTful "rides API" defined in ./backend/src/main/rides/. 

The ./backend/src/main/database/DatabaseManager.js uses the node package mysql (https://www.npmjs.com/package/mysql) to perform MYSQL commands on the databse.


### Running the application locally
If you have mySQL already installed, you may only need the following commands:

```
yarn
yarn run create-db
yarn run refresh-db
yarn run dev
```


**Attention**: The application and tests make use of the database, therefore make sure that you have your environment variables set to configure them to run against the right mysql instance. Ensure you are using the correct table.

Node middleware db-migrate uses paramaters in database.json (see above) and tries to connect to a local mysql database with username `root` and password `admin`. If you want to change those configuration settings you can set as environment variable, for instance:

```
MYSQL_USER=myuser MYSQL_PW=myPassword MYSQL_HOST=myHost MYSQL_PORT=3316 MYSQL_DB=myDB npm run refresh-db
```

You might end up with an error "Client does not support authentication protocol" - to fix refer to https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server.


#### Using Docker for the local db

To make this easier if you've got docker installed you can use that for the local db:

```
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d mysql:5.7
yarn
yarn run create-db
yarn run refresh-db
yarn run dev
```

#### Bypassing login locally

Run with environment variables `UNSAFE_GOD_MODE=true` locally to make yourself an admin, driver and facilitator.

See difference between:

```
yarn run dev
```

```
yarn run start
```

in ./backend/package.json

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

Services are published on api.ride.carpal.org.au.

This is achieved using:

1. An SSL certificate in North Virginia for the domain
2. A configuration in API Gateway for the custom domain as below:
   ![image](api-gateway-custom-doman.png)
3. A Route53 entry for api.ride.carpal.org.au is ALIAS'd (like a hidden CNAME) to the above Target Domain Name.

Ref: https://docs.aws.amazon.com/console/apigateway/custom-domains
