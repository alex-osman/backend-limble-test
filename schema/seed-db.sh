#/bin/bash

MYSQL_PWD="${DATABASE_PASSWORD}" mariadb -u "${DATABASE_USER}" -h "${DATABASE_HOST}" "${DATABASE_NAME}" < /code/seed-db.sql

