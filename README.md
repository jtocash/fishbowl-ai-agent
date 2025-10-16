# Fishbowl Integrated AI Agent

An AI agent that can access your Fishbowl inventory system and provide relevant information to customers. The frontend is currently for testing purposes only - a production frontend implementation will likely use ChatKit.

## Features

- 🤖 AI-powered chatbot using OpenAI
- 📦 Direct integration with Fishbowl Inventory API
- 🔒 Secure credential management
- 🌐 RESTful API with Express backend
- ⚛️ React TypeScript frontend

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
- npm or yarn
- Fishbowl Inventory system with API access
- OpenAI API key

## Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/jtocash/fishbowl-ai-agentl>
cd fishbowl-api
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5001
FISHBOWL_BASE_URL=your_fishbowl_url (including /api)
FISHBOWL_USERNAME=your_fishbowl_username
FISHBOWL_PASSWORD=your_fishbowl_password
FISHBOWL_APP_NAME=FishbowlAIAgent
FISHBOWL_APP_DESCRIPTION=AI Agent for Fishbowl Integration
FISHBOWL_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_api_key
```

The app will need approval in Fishbowl to be able to access the Fishbowl API.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5001
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
