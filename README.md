# Hills Carpal
Hill Carpal is an application to organise Hills Community Aids' programme to provide rides for seniors. It allows facilitators to recieve ride requests over the phone from riders and enter them into the system, and for drivers to find rides to give.

## Architecture
The app is a next.js monolith that uses mysql as a database. It also integrates with Auth0 for authentication.

The current version hasn't been deployed yet, but eventually it'll sit on AWS.

## Running locally
1. First get a local db running, which is easiest with docker
```
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d -v hillscarpaldb:/var/lib/mysql mysql:5.7
yarn run create-db
yarn run refresh-db
```

By default it will try to connect to a local mysql database with username `root` and password `admin`. If you want to change those configurations you can set as environment variable, for instance:

```
MYSQL_USER=myuser MYSQL_PW=myPassword MYSQL_HOST=myHost MYSQL_PORT=3316 MYSQL_DB=myDB npm run refresh-db
```

You might end up with an error "Client does not support authentication protocol" - to fix refer to https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server.

2. Install
```
yarn install
```

3. Run for development
```
yarn run dev
```

It'll be available at http://localhost:3000.

4. Huzzah!

## Deploying

```bash
docker build -t hills-carpal-repo .
docker tag hills-carpal-repo:latest 201335468138.dkr.ecr.ap-southeast-2.amazonaws.com/hills-carpal-repo:<version-number>
aws ecr get-login-password --region ap-southeast-2 --profile hills-carpal | docker login --username AWS --password-stdin 201335468138.dkr.ecr.ap-southeast-2.amazonaws.com #docker login
docker push 201335468138.dkr.ecr.ap-southeast-2.amazonaws.com/hills-carpal-repo:<version-number>
```

Then go to main.tf and change the desired environment to `<version-number>`