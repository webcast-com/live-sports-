# ScoreHub Backend Server

Express.js server providing API endpoints for the ScoreHub frontend, including Betigolo betting tips and match history.

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env` with your RapidAPI credentials:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
PORT=3001
NODE_ENV=development
```

### 3. Run the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode** (built):

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and uptime
- No authentication required

### Betigolo History
- **GET** `/api/betigolo/history`
- Fetches betting tips and predictions from Betigolo API
- Returns: Array of match predictions with odds and recommendations
- Cache: 5 minutes (via Cache-Control header)

**Example Response:**
```json
[
  {
    "id": "123",
    "prediction": "Over 2.5",
    "odds": 1.85,
    "homeTeam": "Manchester United",
    "awayTeam": "Liverpool",
    "league": "Premier League",
    "status": "pending"
  }
]
```

## Architecture

```
server/
├── src/
│   ├── index.ts              # Express app setup
│   └── routes/
│       └── betigolo-history.ts  # Betigolo API handler
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Features

- ✅ CORS enabled for frontend communication
- ✅ Error handling and logging
- ✅ Environment variable validation
- ✅ Response caching
- ✅ Graceful shutdown
- ✅ TypeScript support
- ✅ Development mode with auto-reload (tsx)

## Frontend Integration

The frontend (LiveTickerStrip component) attempts to fetch from the backend first:

```bash
http://localhost:3001/api/betigolo/history
```

If the backend is unavailable, it gracefully falls back to client-side fetching.

## Troubleshooting

### "RAPIDAPI_KEY is not set"
Make sure your `.env` file has the `RAPIDAPI_KEY` environment variable.

### "Port 3001 is already in use"
Change the PORT in `.env`:
```env
PORT=3002
```

### "CORS error from frontend"
Verify the frontend URL is in the CORS_ORIGIN list in `.env`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `RAPIDAPI_KEY` | RapidAPI authentication key | *required* |
| `CORS_ORIGIN` | Allowed origins for CORS | `http://localhost:5173` |

## Development

- TypeScript for type safety
- tsx for TypeScript execution in dev mode
- Express for HTTP server
- CORS middleware for frontend communication

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set production environment variables:
   ```bash
   NODE_ENV=production
   RAPIDAPI_KEY=your_production_key
   ```

3. Start the server:
   ```bash
   npm start
   ```

## License

Part of the ScoreHub project.
