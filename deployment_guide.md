# Deployment Guide: School Management API

This guide provides instructions for deploying the School Management API to a production environment, with a focus on **Render**.

## 📋 Prerequisites

- **Node.js** (v14+)
- **MongoDB** (Managed service recommended, e.g., MongoDB Atlas)
- **Redis** (Managed service recommended, e.g., Redis Cloud)
- **Render Account** (for cloud deployment)

## 🚀 Deployment to Render (Recommended)

Render is a unified cloud to build and run all your apps and websites.

### 1. Create a New Web Service
1.  Connect your GitHub/GitLab repository to Render.
2.  Select the **school-management-api** repository.
3.  Choose **Node** as the runtime.

### 2. Configure Build & Start Commands
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Set Environment Variables
In the Render dashboard, go to the **Environment** tab and add the following keys:

| Key | Description |
| :--- | :--- |
| `ENV` | `production` |
| `USER_PORT` | `5111` (Render will override this with its own `PORT`) |
| `MONGO_URI` | Your production MongoDB connection string |
| `REDIS_URI` | Your production Redis connection string |
| `JWT_SECRET` | A secure, random string |
| `LONG_TOKEN_SECRET` | A secure, random string |
| `SHORT_TOKEN_SECRET` | A secure, random string |
| `NACL_SECRET` | A secure, random string |

*Note: You can copy these values from `.env.production`.*

---

## 🚀 Alternative: Manual Deployment (PM2)

Recommended for VPS or dedicated servers.

1.  **Install dependencies:** `npm install --production`
2.  **Start with PM2:** `pm2 start ecosystem.config.js --env production`
3.  **Check logs:** `pm2 logs school-api`

---

## 🛡️ Best Practices

- **Security:** Use Render's environment variable secrets for sensitive data.
- **Monitoring:** Render provides built-in metrics and log streaming.
- **Health Checks:** You can configure a health check path in Render targeting `/api-docs` or a simple health endpoint if available.
- **Database Connection:** Ensure your database providers (Atlas/Redis Cloud) allow connections from Render's IP range or use `0.0.0.0/0` (with strong passwords) if necessary.

## 🛠 Troubleshooting

- **Port Mapping:** Render automatically handles port mapping. Your app listens on `process.env.PORT` which is handled by the server loader.
- **Database Connection:** Verify that your MongoDB and Redis instances allow connections from the API server.
- **Redis Mocking:** If Redis is unavailable, the API will log a warning. For production, **Redis is strongly recommended**.
