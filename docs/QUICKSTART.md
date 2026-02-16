# Quick Start Guide

## Prerequisites

The School Management API requires the following to be installed and running:

1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Redis** (v6.0 or higher)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Redis & MongoDB (Recommended via Docker)

The easiest way to start both Redis (v7.x) and MongoDB (v7.x) is using Docker Compose.

```bash
docker-compose up -d
```

This will:
- Start Redis 7.x on port 6379 (supports all stream commands like `XREVRANGE`)
- Start MongoDB 7.x on port 27017
- Setup persistent volumes for your data

---

### Alternative: Manual Setup

If you cannot use Docker, follow these steps:

#### manual Redis Setup
**Windows:**
See [INSTALL_REDIS_WINDOWS.md](./docs/INSTALL_REDIS_WINDOWS.md) for detailed instructions.
```bash
# RECOMMENDED: Use WSL for modern Redis
sudo service redis-server start
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Manual MongoDB Setup

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```


### 4. Configure Environment

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` and ensure these values are set:
- `MONGO_URI=mongodb://localhost:27017/school-management`
- `JWT_SECRET=<your-secure-secret>`
- `CACHE_REDIS=redis://127.0.0.1:6379`
- `CORTEX_REDIS=redis://127.0.0.1:6379`
- `OYSTER_REDIS=redis://127.0.0.1:6379`

### 5. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:5111`

## Verifying Installation

### Check Redis
```bash
redis-cli ping
# Should return: PONG
```

### Check MongoDB
```bash
mongosh
# Should connect successfully
```

### Check API
```bash
curl http://localhost:5111/api/user/login
# Should return an error (expected - no credentials provided)
```

## Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:** Start Redis server (see step 2 above)

### MongoDB Connection Error
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Start MongoDB server (see step 3 above)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5111
```

**Solution:** Change `USER_PORT` in `.env` to a different port

## Testing the API

Once the server is running, you can test it using the examples in [TESTING.md](./docs/TESTING.md).

### Quick Test

1. Register a superadmin:
```bash
curl -X POST http://localhost:5111/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "password123",
    "role": "superadmin"
  }'
```

2. You should receive a response with a JWT token.

## Next Steps

- Read the [API Documentation](./README.md)
- Follow the [Testing Guide](./docs/TESTING.md)
- Review the [Implementation Walkthrough](../brain/walkthrough.md)
