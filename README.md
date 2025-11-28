# DataLouna Skinport Shop API

Test task implementation for DataLouna backend developer position.

## 🛠️ Tech Stack

- **Framework**: Hono (TypeScript)
- **Database**: PostgreSQL (using `postgres` package, no ORM)
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Vitest

## 🚀 How to run the project

### Prerequisites

- **Node.js ≥ 23.0.0** (tested on 23.11.1)  
  → Older versions will fail during `npm test` because of native ESM + top-level await support.
- Docker & Docker Compose (any recent version)
  
### Quick Start

1. Clone
   ```bash
   git clone https://github.com/sweetdream-001/datalouna-skinport-shop.git
   cd datalouna-skinport-shop
   ```
   
2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Install and setup**
   ```bash
   npm install
   npm run db:setup
   ```

4. **Configure (optional)**
   ```bash
   # Create .env file (optional, defaults work with Docker)
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datalouna
   REDIS_URL=redis://localhost:6379
   ```

5. **Run**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3000`

## Troubleshooting

| Problem                                    | Solution                                                                 |
|--------------------------------------------|--------------------------------------------------------------------------|
| `docker-compose up` says **permission denied** or **command not found** | Run with sudo: `sudo docker-compose up -d`  |
| `npm test` fails with syntax errors        | You are using Node.js < 23 → install Node 23+ (nvm: `nvm use 23`)        |
| Redis/Postgres containers not starting     | Try `docker-compose down -v && docker-compose up -d --build`             |
| Port 3000 already in use                   | Stop other apps or change port in `Dockerfile` / `docker-compose.yml`    |

## 📡 API Endpoints

### GET `/api/items`

Returns CS:GO items with tradable and non-tradable prices.

**Query Parameters:**
- `currency` (optional): Currency code (default: USD)

**Example Request:**
```bash
curl http://localhost:3000/api/items?currency=USD
```

**Example Response (real data from Skinport API):**
```json
[
  {
    "name": "Sticker | Silver",
    "tradablePrice": 1.1,
    "nonTradablePrice": 0.94
  },
  {
    "name": "Sticker | Perry",
    "tradablePrice": 0.43,
    "nonTradablePrice": 0.37
  },
  {
    "name": "★ Stiletto Knife | Urban Masked (Factory New)",
    "tradablePrice": 947.5,
    "nonTradablePrice": 805.38
  }
]
```
*Note: Returns up to 50 items with real CS:GO market prices from Skinport*

### POST `/api/buy`

Purchase a product for a user.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1}'
```

**Success Response:**
```json
{
  "success": true,
  "newBalance": 40.08
}
```

**Error Responses:**

*Insufficient balance:*
```json
{
  "success": false,
  "message": "Insufficient balance"
}
```

*User not found:*
```json
{
  "success": false,
  "message": "User not found"
}
```

*Product not found:*
```json
{
  "success": false,
  "message": "Product not found"
}
```

## 🧪 Testing

**Quick API test (curl):**
```bash
# Test items endpoint - returns real CS:GO skin prices
curl http://localhost:3000/api/items

# Test with different currency
curl http://localhost:3000/api/items?currency=EUR

# Test purchase endpoint - successful purchase
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1}'

# Test error cases
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{"userId": 999, "productId": 1}'  # User not found

curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "productId": 5}'  # Insufficient balance
```

**Unit tests:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode (for development)
npm run test:coverage # With coverage report
```

**Test Coverage**: 36 tests across 5 test suites (unit, integration, route tests)

## 🗄️ Database

Three tables: `users`, `products`, `purchases`. See `schema.sql` for schema and sample data.

## 🎮 Fun Fact

As a CS2 fan, I defaulted to `app_id=730` for CS:GO skins—pulled real AK-47 prices! The API returns actual market data from Skinport, so you're seeing real CS:GO skin prices.

## 🔒 Key Features

- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Database transactions for purchase atomicity
- ✅ `FOR UPDATE` lock prevents race conditions
- ✅ Redis caching (5-minute TTL)
- ✅ Graceful degradation (stale cache fallback)
- ✅ Input validation with Zod
- ✅ TypeScript strict mode

## 📦 Build

```bash
npm run build
npm start
```

## 🚀 Future Improvements (Production)

For production deployment, consider adding:

- **Rate Limiting**: Protect external API calls (e.g., Skinport) from abuse and prevent IP bans
- **Structured Logging**: Replace `console.log` with structured logging (Winston, Pino) for better log aggregation and analysis
- **API Monitoring**: Health check endpoints and metrics collection
- **API Versioning**: Version endpoints (e.g., `/api/v1/items`) for backward compatibility

---

**Built for DataLouna.io**
