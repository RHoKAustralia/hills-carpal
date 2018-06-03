ENV=${1:-dev}

BUCKET="s3://carpal-ui-rides-"$ENV"/"
cd ../frontend/
npm run build
mv build/* ../infrastructure/ui-rides
echo "Publishing to "$BUCKET
aws s3 sync ui-rides/ $BUCKET
