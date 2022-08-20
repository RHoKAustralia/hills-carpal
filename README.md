# Hills Carpal
Hill Carpal is an application to organise Hills Community Aids' programme to provide rides for seniors. It allows facilitators to recieve ride requests over the phone from riders and enter them into the system, and for drivers to find rides to give.

## Architecture
The app is a next.js monolith that uses mysql as a database. It also integrates with Auth0 for authentication.

## Running locally
1. Install
```
npm install
```

2. First get a local db running, which is easiest with docker
```
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d -v hillscarpaldb:/var/lib/mysql mysql:5.7
npm run create-db
npm run refresh-db
```

By default it will try to connect to a local mysql database with username `root` and password `admin`. If you want to change those configurations you can set as environment variable, for instance:

```
MYSQL_USER=myuser MYSQL_PW=myPassword MYSQL_HOST=myHost MYSQL_PORT=3316 MYSQL_DB=myDB npm run refresh-db
```

You might end up with an error "Client does not support authentication protocol" - to fix refer to https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server.

3. Get the `.env.local` file that provides certain environment variables from @AlexGilleran. If you skip this step you'll get annoying error messages about a missing client secret.

4. Run for development
```
npm run dev
```

It'll be available at http://localhost:3000.

5. Huzzah!

## Deploying
This is automatically deployed to AWS now. Anything that's pushed to master goes to the training environment, anything pushed with a tag goes to the prod environment. You should be able to see the results of the builds on github.
