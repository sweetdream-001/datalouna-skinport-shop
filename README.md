# DataLouna Skinport Shop API

Test task implementation for DataLouna backend developer position.

## 🛠️ Tech Stack

- **Framework**: Hono (TypeScript)
- **Database**: PostgreSQL (using `postgres` package, no ORM)
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Vitest

## 🚀 Quick Start

1. **Start services**
   ```bash
   docker-compose up -d
   ```

2. **Install and setup**
   ```bash
   npm install
   npm run db:setup
   ```

3. **Configure (optional)**
   ```bash
   # Create .env file (optional, defaults work with Docker)
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datalouna
   REDIS_URL=redis://localhost:6379
   ```

4. **Run**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3000`

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

---

**Built for DataLouna.io**
