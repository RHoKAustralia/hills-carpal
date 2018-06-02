ENV=${1:-dev}

BUCKET="s3://carpal-ui-rides-"$ENV"/"
echo "Publishing to "$BUCKET
aws s3 sync ui-rides/ $BUCKET
