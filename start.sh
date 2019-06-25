#!/usr/bin/env bash

echo "Starting database"
docker run --name hills-carpal -p 3306:3306 -e MYSQL_ROOT_PASSWORD=admin -d mysql:5.7

echo "Starting backend"
cd backend
yarn
yarn run refresh-db
UNSAFE_GOD_MODE=true yarn start

echo "Starting frontend"
cd -
cd frontend
yarn
yarn local
