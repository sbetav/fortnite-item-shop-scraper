# Fortnite Item Shop Scraper

A Node.js server that scrapes the Fortnite item shop using Playwright to bypass Cloudflare protection.

## Features

- Uses Playwright with Chromium to bypass Cloudflare protection
- Express.js REST API
- CORS enabled for cross-origin requests
- Error handling and graceful shutdown
- Browser instance reuse for better performance

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

## API Endpoints

### GET /api/item-shop
Scrapes the Fortnite item shop and returns the data.

**Response:**
```json
{
  "success": true,
  "data": {
    // Fortnite item shop data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /
Returns API information and available endpoints.

## Example Usage

```bash
# Get item shop data
curl http://localhost:3000/api/item-shop

# Health check
curl http://localhost:3000/health
```

## Configuration

The server uses the following default configuration:
- Port: 3000 (can be changed with `PORT` environment variable)
- Headless browser mode
- User agent: Chrome on Windows
- Viewport: 1920x1080

## Error Handling

The server includes comprehensive error handling:
- Network timeouts
- Cloudflare challenge handling
- JSON parsing errors
- Browser initialization errors

## Dependencies

- **express**: Web framework
- **playwright**: Browser automation
- **cors**: Cross-origin resource sharing

## Notes

- The server reuses browser instances for better performance
- Cloudflare protection is bypassed using Playwright's stealth capabilities
- The scraper waits for network idle to ensure full page load
- Graceful shutdown is implemented to properly close browser instances

