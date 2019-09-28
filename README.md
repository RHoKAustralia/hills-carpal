# hills-carpal

[![CircleCI](https://circleci.com/gh/RHoKAustralia/hills-carpal.svg?style=svg)](https://circleci.com/gh/RHoKAustralia/hills-carpal)

# How to get set up for local dev
(for more thorough instructions on backend config, see /.backend/readme.md)
1. Prepare mySQL for local development, which is easiest with docker
```

docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d -v hillscarpaldb:/var/lib/mysql mysql:5.7
```

2. Build project packages and dependencies and create the database
```
cd backend
yarn
yarn run create-db
yarn run refresh-db
```

2. Run the backend locally
```
cd backend
yarn run dev
```

It _should_ reload the code every time it's run, so there's no need to stop it and start it again when you make changes.

3. Run the frontend (in another tab)
```
cd frontend
yarn run local
```

4. Huzzah!

# How to deploy
- There's actually a working CI setup! Refer to .circleci/config.yml



