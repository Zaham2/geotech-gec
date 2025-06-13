# Geotech-GEC - AI-Powered Engineering Platform

A full-stack application for geotechnical engineering with AI agent capabilities powered by OpenAI.

## Architecture

- **Backend**: NestJS with TypeScript
- **Frontend**: ReactJS with TypeScript
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API (ChatGPT)
- **Deployment**: Docker & VPS ready
- **Future**: React Native support

## Features

- AI-powered geotechnical calculations and analysis
- Real-time chat with geotechnical AI agent
- Project management for geotechnical studies
- Data visualization and reporting
- User authentication and authorization
- RESTful API with OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd baba-geotechnical
   npm run install:all
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Update with your OpenAI API key and database credentials
   ```

3. **Start Development Servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually
   npm run dev:backend
   npm run dev:frontend
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api

### Docker Deployment

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## Project Structure

```
baba-geotechnical/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   ├── common/
│   │   └── main.ts
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml      # Multi-service Docker setup
└── README.md
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/baba_geotechnical
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## Deployment to VPS

1. **Prepare your VPS**
   - Install Docker & Docker Compose
   - Configure firewall for ports 80, 443, 3000, 3001

2. **Deploy using Docker**
   ```bash
   # On your VPS
   git clone <your-repo>
   cd baba-geotechnical
   docker-compose up -d
   ```

3. **Configure Nginx** (recommended for production)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 