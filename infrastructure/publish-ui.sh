ENV=${1:-dev}

BUCKET="s3://hills-carpal-"$ENV"/"
cd ../frontend/
yarn install
yarn run build
rm -rf ../infrastructure/ui-rides/*
md -p ../infrastructure/ui-rides
mv build/* ../infrastructure/ui-rides

cd ../infrastructure
echo "Publishing to "$BUCKET
aws s3 sync ui-rides/ $BUCKET
