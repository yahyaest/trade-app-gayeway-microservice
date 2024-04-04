#!/bin/sh
ENV=${ENV:-PROD}


# Create or update .env file with provided environment variables

echo "BASE_URL=${BASE_URL}" > /app/.env
echo "TZ=${TZ}" >> /app/.env
echo "DATABASE_URL=${DATABASE_URL}" >> /app/.env
echo "JWT_SECRET=${JWT_SECRET}" >> /app/.env
echo "CLIENT_URL=${CLIENT_URL}" >> /app/.env
echo "CLIENT_DOMAIN=${CLIENT_DOMAIN}" >> /app/.env

# Change to the app directory
cd /app

# Continue with the CMD (your main application command)
# exec "$@"

if [ "$ENV" = "PROD" ]
then
    npm run build
    npm run start:migrate:prod
else
    npm run start:migrate:dev
fi
