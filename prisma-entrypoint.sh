#!/bin/sh
echo "Running Prisma migrations..."
pnpm prisma migrate deploy

echo "Starting application..."
pnpm start:prod