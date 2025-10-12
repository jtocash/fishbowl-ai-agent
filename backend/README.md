# Backend Setup Instructions

## 1. Install Dependencies
```bash
cd backend
npm install
```

## 2. Create Environment File
Create a `.env` file in the backend directory with:
```
PORT=5000
FISHBOWL_BASE_URL=http://localhost:8080
FISHBOWL_APP_ID=12345
```

## 3. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 4. Update Frontend Environment
Add to your frontend `.env` file:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/fishbowl/login` - Login to Fishbowl
- `GET /api/health` - Health check

### Fishbowl API Proxy
- `GET /api/fishbowl/*` - Proxy GET requests to Fishbowl
- `POST /api/fishbowl/*` - Proxy POST requests to Fishbowl
- `PUT /api/fishbowl/*` - Proxy PUT requests to Fishbowl
- `DELETE /api/fishbowl/*` - Proxy DELETE requests to Fishbowl

## Security Features
- Credentials stored on server only
- CORS enabled for frontend communication
- Token-based authentication
- Request validation and error handling
