# Deployment Guide

## 🚀 Railway (Recommended - Easiest)

1. **Push to GitHub** (if not already done)
2. **Go to [Railway.app](https://railway.app)**
3. **Sign up with GitHub**
4. **Click "New Project" → "Deploy from GitHub repo"**
5. **Select your repository**
6. **Railway will auto-detect Node.js and deploy**

**Environment Variables** (if needed):
- `PORT` - Railway sets this automatically

## 🐳 Fly.io (Docker-based)

1. **Install Fly CLI**: `npm install -g @fly/flyctl`
2. **Login**: `flyctl auth login`
3. **Initialize**: `flyctl launch` (creates fly.toml)
4. **Deploy**: `flyctl deploy`

## ☁️ Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your repository**
5. **Settings**:
   - **Build Command**: `npm install && npx playwright install chromium`
   - **Start Command**: `node server.js`
   - **Environment**: Node

## 🔧 Environment Variables

All platforms support these environment variables:
- `PORT` - Server port (auto-set by platform)
- `NODE_ENV` - Set to 'production' in production

## 📝 Notes

- **Railway**: Best for beginners, auto-detects everything
- **Fly.io**: Best performance, requires Docker knowledge
- **Render**: Good middle ground, reliable

## 🚨 Important

- All platforms will automatically install Playwright browsers
- The server will run on the platform's assigned port
- Health check endpoint `/health` is configured for monitoring
