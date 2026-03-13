# MicroserviceSwapture

A lightweight Node.js/Express microservice for capturing and swapping data.

## Requirements

- Node.js >= 18

## Setup

```bash
npm install
cp .env.example .env   # adjust PORT if needed
```

## Running the server

```bash
npm start        # production
npm run dev      # development (auto-reload via nodemon)
```

The server listens on port **3000** by default (configurable via the `PORT` environment variable).

## API

### `GET /health`
Returns the service status.

```json
{ "status": "ok", "service": "MicroserviceSwapture", "timestamp": "..." }
```

### `POST /swap`
Swaps the values of fields `a` and `b`.

**Request body:** `{ "a": <value>, "b": <value> }`

**Response:** `{ "a": <former b>, "b": <former a> }`

### `POST /capture`
Stores a JSON payload and returns it with a generated `id`.

**Request body:** any non-empty JSON object

**Response:** `{ "id": 1, "data": { ... }, "capturedAt": "..." }`

### `GET /capture/:id`
Retrieves a previously captured entry by its `id`.

## Tests

```bash
npm test
```