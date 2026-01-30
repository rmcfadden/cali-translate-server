#!/bin/bash

# Start MySQL in the background
docker-entrypoint.sh mysqld &

# Wait for MySQL to be ready
until mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

echo "MySQL is ready. Running create.sql script..."

# Run the create.sql script
mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < /sql-scripts/create.sql

echo "create.sql script executed successfully."

# Keep the container running
wait