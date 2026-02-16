# Installing Redis on Windows - Step by Step

## Option 1: Using Docker (RECOMMENDED - Redis 7.x)

This is the **recommended approach** as it provides Redis 7.x which fully supports all stream commands including `XREVRANGE`.

### Prerequisites
- Docker Desktop installed on Windows ([Download here](https://www.docker.com/products/docker-desktop))

### Step 1: Start Redis with Docker Compose

The project includes a `docker-compose.yml` file that sets up both Redis 7 and MongoDB.

```bash
# Navigate to the project directory
cd c:\Users\user\Documents\assessment\school-management-api

# Start Redis and MongoDB
docker-compose up -d

# Verify Redis is running
docker-compose ps
```

### Step 2: Verify Redis Connection

```bash
# Test Redis connection
docker exec -it school-api-redis redis-cli ping
```

You should see: `PONG`

### Step 3: Check Redis Version

```bash
# Verify you're running Redis 7.x
docker exec -it school-api-redis redis-cli INFO server | grep redis_version
```

You should see: `redis_version:7.x.x`

### Managing Docker Services

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs redis
docker-compose logs mongodb

# Restart services
docker-compose restart

# Stop and remove all data ( WARNING: This deletes all data)
docker-compose down -v
```

---

## Option 2: Direct Download ( NOT RECOMMENDED - Old Version)

> **Warning:** The official Redis for Windows is outdated (v3.0.504) and **does not support** modern Redis Stream commands like `XREVRANGE`. This will cause errors with the School Management API.

### Step 1: Download Redis
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Look for **Redis-x64-3.0.504.msi** (or latest version)
3. Click to download the .msi installer

### Step 2: Install Redis
1. Run the downloaded .msi file
2. Click "Next" through the installation wizard
3. **IMPORTANT:** Check the box "Add the Redis installation folder to the PATH environment variable"
4. Complete the installation

### Step 3: Start Redis
Redis should start automatically after installation. To verify:

```bash
# Open a new terminal and run:
redis-cli ping
```

You should see: `PONG`

If Redis is not running, start it manually:
```bash
redis-server
```

---

## Option 3: Using WSL (Windows Subsystem for Linux)

If you have WSL installed, you can run a modern version of Redis:

```bash
# Start WSL
wsl

# Update package list
sudo apt-get update

# Install Redis (will be version 6.x or 7.x depending on Ubuntu version)
sudo apt-get install redis-server

# Start Redis
sudo service redis-server start

# Check version
redis-cli INFO server | grep redis_version
```

---

## Verifying Redis is Running

Open a new terminal and run:
```bash
redis-cli ping
```

Expected output: `PONG`

## Next Steps

Once Redis is installed and running:

1. Keep the Redis server running (or use Docker Compose)
2. Open a new terminal
3. Navigate to the project directory
4. Run: `npm start`

The School Management API should now start successfully!

## Troubleshooting

### "XREVRANGE command not found" or similar stream errors
- **Solution:** You're using an old version of Redis. Use Docker (Option 1) to get Redis 7.x

### Docker connection issues
- Make sure Docker Desktop is running
- Check if services are up: `docker-compose ps`
- View logs: `docker-compose logs redis`

### "redis-cli is not recognized" (Option 2)
- Make sure you checked "Add to PATH" during installation
- Or restart your terminal
- Or navigate to the Redis installation directory first

### Redis won't start (Option 2)
- Check if port 6379 is already in use
- Try running as Administrator

### Port already in use
```bash
# Check what's using port 6379
netstat -ano | findstr :6379

# If old Redis is running, stop it or use Docker on a different port
```
