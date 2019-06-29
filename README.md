# hills-carpal

[![CircleCI](https://circleci.com/gh/RHoKAustralia/hills-carpal.svg?style=svg)](https://circleci.com/gh/RHoKAustralia/hills-carpal)

# How to get set up for local dev
1. First get a local db running, which is easiest with docker
```
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d mysql:5.7
yarn run create-db
yarn run refresh-db
```

2. Run the backend locally
```
cd backend
yarn start
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



