# Installation

## Docker

To set up the environment, you will need to first install [Docker](https://docs.docker.com/engine/install/).
This test uses Docker Compose to run everything.

## Backend Server

The backend server uses Node.js, but you don't need to have that installed on your machine. You can install
the dependencies by running:

```bash
docker compose run server npm i
```

## Database

To bring up the database:

```bash
docker compose up -d db
```

Once it's ready to go, you can run the schema migrator to build the schema:

```bash
docker compose run migrate
```

To seed the database with test data used in the jest tests run seed:
```bash
docker compose run seed
```

If that fails (because of something like an already existing table), you can always start with a clean slate
by bringing the DB container down:

```bash
docker compose down
```

To run jest tests run:
```bash
docker compose run test
```

## API Endpoints

The API provides two endpoints to calculate labor costs for workers and locations. Each endpoint allows filtering by task status (complete, incomplete, or both), worker IDs, and location IDs. These are `GET` requests and use query parameters to filter the response.

### 1. **Get Labor Cost by Worker**

- **Endpoint**: `/analytics/by-worker`
- **Method**: `GET`
- **Query Parameters**:
  - `taskStatus` (required): Must be one of `"COMPLETE"`, `"INCOMPLETE"`, or `"BOTH"`. Determines whether to include completed tasks, incomplete tasks, or both.
  - `workerIds` (optional): A comma-separated list of worker IDs to filter by specific workers (e.g., `workerIds=1,2,3`).
  - `locationIds` (optional): A comma-separated list of location IDs to filter workers only working in specific locations (e.g., `locationIds=1,2`).

#### Example Request:

```bash
GET /analytics/by-worker?taskStatus=COMPLETE&workerIds=1,2,3&locationIds=3
```

#### Example Response:

```json
{
  "data": {
    "totalCost": 905,
    "breakdown": [
      {
        "workerId": 1,
        "workerName": "John Doe",
        "totalCost": 150
      },
      {
        "workerId": 2,
        "workerName": "Jane Smith",
        "totalCost": 300
      },
      {
        "workerId": 3,
        "workerName": "Bob Lee",
        "totalCost": 455
      }
    ]
  },
}
```
    
### 2. **Get Labor Cost by Location**

- **Endpoint**: `/analytics/by-location`
- **Method**: `GET`
- **Query Parameters**:
  - `taskStatus` (required): Must be one of `"COMPLETE"`, `"INCOMPLETE"`, or `"BOTH"`. Determines whether to include completed tasks, incomplete tasks, or both.
  - `workerIds` (optional): A comma-separated list of worker IDs to filter only tasks performed by those workers (e.g., `workerIds=1,2`).
  - `locationIds` (optional): A comma-separated list of location IDs to filter by specific locations (e.g., `locationIds=1,2,3`).

#### Example Request:

```bash
GET /analytics/by-location?taskStatus=INCOMPLETE&locationIds=1,2
```

#### Example Response:

```json
{
  "data": {
    "totalCost": 500,
    "breakdown": [
      {
        "locationId": 1,
        "locationName": "Warehouse A",
        "totalCost": 300
      },
      {
        "locationId": 2,
        "locationName": "Head Office",
        "totalCost": 200
      }
    ]
  },
}
```

## TODO
- [ ] Add Joi schema validation to all routes
- [ ] Write additional unit tests for validation functions
- [ ] Add Docker commands for production
- [ ] Implement pagination for large data sets in analytics endpoints
- [ ] Optimize database queries for better performance under high load
- [ ] Add rate limiting to prevent abuse of the API


