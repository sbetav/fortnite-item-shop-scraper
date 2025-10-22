# Fortnite Item Shop Scraper API

A comprehensive Node.js REST API that scrapes Fortnite item shop data and jam tracks using Playwright to bypass Cloudflare protection. Built with TypeScript, Express.js, and modern web scraping techniques.

## 🚀 Features

### Core Functionality

- **Item Shop Scraping**: Get current Fortnite item shop data with multi-language support
- **Individual Item Details**: Fetch detailed information for specific items
- **Jam Tracks Processing**: Scrape and process Fortnite jam tracks with audio support
- **Audio Streaming & Download**: Stream or download jam track audio files
- **Multi-Language Support**: Support for 14 languages including Deutsch, English, Español, Français, Italiano, Polski, Português (Brasil), Türkçe, Русский, العربية, 日本語, 简体中文, 한국어, and more

### Technical Features

- **Cloudflare Bypass**: Uses Playwright with Chromium to bypass Cloudflare protection
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **API Key Authentication**: Secure API access with configurable authentication
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Shutdown**: Proper cleanup of browser instances
- **CORS Support**: Cross-origin request support for web applications
- **Security Headers**: Helmet.js integration for security
- **Request Logging**: Detailed request and response logging

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Steps

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd fortnite-item-shop-scrapper
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install Playwright browsers:**

   ```bash
   npx playwright install
   ```

4. **Set up environment variables (optional):**
   ```bash
   # Create .env file
   echo "API_KEY=your-secure-api-key" > .env
   echo "PORT=3333" >> .env
   ```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Build TypeScript

```bash
npm run build
```

The server will start on `http://localhost:3333` (or the port specified in your environment variables).

## 📡 API Endpoints

### Item Shop Endpoints

#### `GET /api/item-shop`

Scrapes the complete Fortnite item shop data.

**Query Parameters:**

- `lang` (optional): Language code (default: `en-US`)

**Example:**

```bash
curl -H "x-api-key: your-api-key" "http://localhost:3333/api/item-shop?lang=es-ES"
```

**Response:**

```json
{
  "success": true,
  "data": {
    // Complete Fortnite item shop data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/item-shop/item/:assetType/:itemId`

Fetches detailed information for a specific item.

**Path Parameters:**

- `assetType`: Type of asset (bundles, outfits, emotes, etc.)
- `itemId`: Unique identifier for the item

**Query Parameters:**

- `lang` (optional): Language code (default: `en-US`)

**Example:**

```bash
curl -H "x-api-key: your-api-key" "http://localhost:3333/api/item-shop/item/bundles/ravemello-35c6f4c5"
```

#### `GET /api/item-shop/languages`

Returns supported languages (no authentication required).

**Response:**

```json
{
  "success": true,
  "data": {
    "supportedLanguages": [
      "de",
      "en-US",
      "es-ES",
      "es-MX",
      "fr",
      "it",
      "pl",
      "pt-BR",
      "tr",
      "ru",
      "ar",
      "ja",
      "zh-Hans",
      "ko"
    ],
    "defaultLanguage": "en-US"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Jam Tracks Endpoints

#### `GET /api/jam-tracks`

Scrapes Fortnite jam tracks data.

**Response:**

```json
{
  "success": true,
  "data": {
    // Jam tracks data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/jam-tracks`

Processes a qsep:// URL and returns jam track data with audio information.

**Request Body:**

```json
{
  "url": "qsep://example.com/track"
}
```

#### `POST /api/jam-tracks/stream`

Streams jam track audio in real-time for large files.

**Request Body:**

```json
{
  "url": "qsep://example.com/track"
}
```

#### `POST /api/jam-tracks/audio`

Downloads jam track audio directly as a complete file.

**Request Body:**

```json
{
  "url": "qsep://example.com/track"
}
```

### Utility Endpoints

#### `GET /health`

Health check endpoint (no authentication required).

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /`

Returns API information and available endpoints (no authentication required).

## 🔧 Configuration

### Environment Variables

| Variable  | Description                | Default | Required                    |
| --------- | -------------------------- | ------- | --------------------------- |
| `PORT`    | Server port                | `3333`  | No                          |
| `API_KEY` | API key for authentication | None    | No (unprotected if not set) |

### Rate Limits

- **General API**: 100 requests per 15 minutes
- **Scraping Endpoints**: 20 requests per 15 minutes
- **Health Check & Languages**: No rate limiting

### Authentication

Most endpoints require an API key in the `x-api-key` header:

```bash
curl -H "x-api-key: your-api-key" "http://localhost:3333/api/item-shop"
```

**Endpoints that don't require authentication:**

- `GET /health`
- `GET /`
- `GET /api/item-shop/languages`

## 🛠️ Development

### Project Structure

```
src/
├── config/           # Configuration files
├── features/         # Feature modules
│   ├── item-shop/   # Item shop functionality
│   └── jam-tracks/  # Jam tracks functionality
├── middleware/       # Express middleware
├── shared/          # Shared utilities
│   ├── browser/     # Browser service
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functions
└── server.ts        # Main server file
```

### Available Scripts

```bash
npm run dev      # Development with auto-restart
npm run build    # Build TypeScript
npm start        # Production start
npm run lint     # Lint code
npm test         # Run tests
```

## 🔒 Security Features

- **API Key Authentication**: Secure access control
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Security Headers**: Helmet.js integration for security
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Parameter and request validation
- **Error Handling**: Secure error responses without sensitive data

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t fortnite-scraper .

# Run container
docker run -p 3333:3333 -e API_KEY=your-key fortnite-scraper
```

### Railway Deployment

The project includes `railway.json` for easy Railway deployment:

```bash
# Deploy to Railway
railway login
railway link
railway up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📋 Project Status & TODO

### ✅ Completed Features

- **✅ Core API Implementation**

  - Item shop data scraping with multi-language support
  - Individual item detail fetching
  - Jam tracks data scraping and processing
  - Audio streaming and download functionality

- **✅ Security & Authentication**

  - API key authentication system
  - Rate limiting (general: 100/15min, scraping: 20/15min)
  - Security headers with Helmet.js
  - CORS configuration
  - Input validation and sanitization

- **✅ Documentation & Code Quality**

  - Comprehensive JSDoc documentation across all files
  - Complete API documentation with examples
  - TypeScript type definitions and interfaces
  - Clean code structure with proper separation of concerns
  - Removed redundant comments and logs

- **✅ Error Handling & Logging**

  - Request/response logging middleware
  - Error logging with stack traces
  - Graceful shutdown handling
  - Browser resource management

- **✅ Multi-Language Support**
  - Support for 14 languages: Deutsch, English, Español, Français, Italiano, Polski, Português (Brasil), Türkçe, Русский, العربية, 日本語, 简体中文, 한국어
  - Language validation and fallback to English

### 🚧 TODO: Future Improvements

- [ ] In-memory cache for item shop data (15-minute TTL)
- [ ] Cache invalidation on shop refresh (7 PM GMT-5)
- [ ] Browser connection pooling

## ⚠️ Disclaimer

This project is for educational and research purposes only. Please respect Fortnite's terms of service and use responsibly. The authors are not responsible for any misuse of this software.
