#!/bin/bash

# Create or update .env file with provided environment variables

echo "BASE_URL=${BASE_URL}" > /app/.env
echo "TZ=${TZ}" >> /app/.env
echo "DATABASE_URL=${DATABASE_URL}" >> /app/.env
echo "JWT_SECRET=${JWT_SECRET}" >> /app/.env
echo "CLIENT_URL=${CLIENT_URL}" >> /app/.env
echo "CLIENT_DOMAIN=${CLIENT_DOMAIN}" >> /app/.env


# Continue with the CMD (your main application command)
# exec "$@"

npm run start:migrate:dev