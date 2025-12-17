# INCX
Inconvinience Experience - or short **INCX** - is an application which sarcastically and humoristically demonstrates anti - patterns in everyday applications. The purpose of this project is to demonstrate how bad UIs influences the experience with a product, even if it is fully functional. The goal is to raise the awareness about such patterns for both every-day users and developers of said applications.

## Prerequisites
- **Docker Engine** v4.37.2 or newer
- **A dry sense of humor** (mandatory)
- Knowledge about using a CLI and Docker

## Setup
After pulling the the repository a **.env** file has to be created at the root directory with the following attributes:

- **DB_NAME**: Name of the database within PostgreSQL
- **DB_USER**: Username for PostgreSQL
- **DB_PASS**: Password for PostgreSQL
- **DB_PORT**: Port to which the PostgreSQL is exposed (default)
- **BACKEND_PORT**: Port to which the backend is exposed (default 8080)
- **FRONTEND_PORT**: Port to which the frontend is exposed (default 3000)
- **MINIO_ROOT_USER**: Username for MinIO
- **MINIO_ROOT_PASSWORD**: Password for MinIO
- **MINIO_PORT**: Port to which the PostgreSQL is exposed (default 9000)
- **MINIO_URL**: the URL over which minio is reachable (e.g. http://\<address>:MINIO_PORT)
- **VITE_BACKEND_URL**: the URL over which the frontend may reach the backend (default: http://incx-backend:BACKEND_PORT/api)

## How to run
After verifying the Docker Engine is up and running; to run the application run the following commands in the CLI within the root directory of the project:

```cli
cd frontend && npm install
cd ..
docker-compose up --build --watch
```

The initial startup may take a minute or two.

## Issues
Face any issues and you are certain it is not the application acting weird on purpose? Well then submit a issue on Github!