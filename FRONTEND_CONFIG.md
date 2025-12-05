# Frontend Configuration Guide

## Environment Variables

The frontend can be configured using environment variables in `.env` file.

### Setup

1. **Copy the example file:**
```bash
cd frontend
cp .env.example .env
```

2. **Edit `.env` with your configuration:**
```
VITE_API_URL=http://localhost:5000/api
VITE_FALLBACK_PORTS=5000,5001,5002
VITE_DEV_SERVER_HOST=localhost
VITE_DEV_SERVER_PORT=5173
```

## Configuration Options

### VITE_API_URL
**Default:** `http://localhost:5000/api`

The main API URL where the backend is running.

**Examples:**
- Local development: `http://localhost:5000/api`
- Different host: `http://192.168.1.100:5000/api`
- Production: `https://api.example.com/api`
- Custom port: `http://localhost:5001/api`

### VITE_FALLBACK_PORTS
**Default:** `5000,5001,5002`

Comma-separated list of ports to try if the main API_URL fails.

**Examples:**
- Standard fallback: `5000,5001,5002`
- More attempts: `5000,5001,5002,5003,5004`
- Single port: `5000`

## How It Works

1. **Initial Request:** Frontend tries to connect to the URL specified in `VITE_API_URL`

2. **Fallback Triggered:** If a request fails and no response is received:
   - Console shows warning: `⚠ API failed on 5000. Trying fallback port 5001...`
   - Frontend automatically tries the first fallback port

3. **Success:** When a working port is found:
   - Console shows: `✓ Using fallback API URL: http://localhost:5001/api`
   - All subsequent requests use this URL

## Common Scenarios

### Scenario 1: Port 5000 is in use by system process
```
VITE_API_URL=http://localhost:5000/api
VITE_FALLBACK_PORTS=5000,5001,5002
```
→ Frontend will automatically detect port 5001 or 5002

### Scenario 2: Backend runs on custom port
```
VITE_API_URL=http://localhost:5002/api
VITE_FALLBACK_PORTS=5000,5001,5002
```
→ Frontend will use port 5002 directly

### Scenario 3: Backend on remote server
```
VITE_API_URL=http://192.168.1.100:5000/api
VITE_FALLBACK_PORTS=5000,5001,5002
```
→ Frontend will fallback to other ports on same remote host if needed

### Scenario 4: Production server
```
VITE_API_URL=https://api.example.com/api
VITE_FALLBACK_PORTS=5000,5001,5002
```
→ Frontend will use HTTPS and not try HTTP fallbacks (only same domain)

## Debugging

Check the browser console (F12) for messages:

**Success:**
```
✓ Using fallback API URL: http://localhost:5001/api
```

**Fallback triggered:**
```
⚠ API failed on 5000. Trying fallback port 5001...
```

**No ports available:**
```
Network error when trying to reach API
```

## Docker/Container Setup

If frontend is in a container and backend on host:

```
# In container, cannot use localhost
VITE_API_URL=http://host.docker.internal:5000/api
```

Or if using docker-compose with service names:
```
VITE_API_URL=http://backend:5000/api
```

## Environment Variables in Production

For production builds, you can set environment variables when building:

```bash
# Build with custom API URL
VITE_API_URL=https://api.example.com/api npm run build

# Or set in CI/CD pipeline
export VITE_API_URL=https://api.example.com/api
npm run build
```

## Troubleshooting

### Frontend shows "Cannot reach API"
1. Check `VITE_API_URL` in `.env`
2. Verify backend is running on that port
3. Check browser console for error details
4. Try one of the fallback ports manually in browser

### .env changes not taking effect
1. Make sure you're editing `frontend/.env` (not `.env.example`)
2. Restart dev server: `npm run dev`
3. Clear browser cache if needed

### API works sometimes but not always
1. There might be multiple backend instances running
2. Check what's listening on ports 5000, 5001, 5002:
   ```bash
   # macOS/Linux
   lsof -i :5000
   lsof -i :5001
   lsof -i :5002
   
   # Windows
   netstat -ano | findstr :5000
   ```
3. Kill conflicting processes
4. Restart the application

