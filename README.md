# Fishbowl Integrated AI Agent

An AI agent that can access your Fishbowl inventory system and provide relevant information to customers. The frontend is currently for testing purposes only - a production frontend implementation will likely use ChatKit.

Frontend will be removed in favor of Postman testing.

## Tech Stack

**Backend:**

- Node.js + Express
- TypeScript
- OpenAI Agents SDK
- Axios for Fishbowl API communication

**Frontend:**

- React 19
- TypeScript
- Axios

## Prerequisites

- Node.js (v16 or higher)
- Node Package Manager
- Fishbowl Inventory system with API access
- OpenAI API key

## Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/jtocash/fishbowl-ai-agent>
cd fishbowl-api
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
FISHBOWL_BASE_URL=your_fishbowl_url (with /api at the end)
FISHBOWL_USERNAME=your_fishbowl_username
FISHBOWL_PASSWORD=your_fishbowl_password
FISHBOWL_APP_NAME=FishbowlAIAgent
FISHBOWL_APP_DESCRIPTION=AI Agent for Fishbowl Integration
FISHBOWL_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_api_key
GRAPH_CERTIFICATE_PASSWORD = your graph certificate password
GRAPH_USER_EMAIL = the email your agent is sending from
GRAPH_TENANT_ID = your microsoft entra id tenant id
GRAPH_CLIENT_ID = your microsoft entra id client id
PRODUCTION_URL = the url your server is accepting api requests on when started with start:prod
NGROK_TUNNEL = the url your server is accepting api requests when started with any other command
WEBHOOK_CLIENT_STATE_SECRETPHRASE = secret phrase used for webhook notification verification, you can set it to whatever you want, just make it secure
```

The app will need approval in Fishbowl to be able to access the Fishbowl API.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5001`

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`
