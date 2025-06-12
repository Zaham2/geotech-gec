# Baba Geotechnical Frontend

React frontend application for the Baba Geotechnical platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file (optional):
```bash
# Create .env.local file with:
VITE_API_URL=http://localhost:3001
```

3. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Features

- **Dashboard**: Overview of projects, calculations, and AI interactions
- **Projects**: Create and manage geotechnical engineering projects
- **Calculations**: Perform various geotechnical calculations with AI assistance
- **AI Chat**: Interactive chat with AI geotechnical expert
- **Reports**: Generate and manage AI-powered reports
- **Authentication**: Secure login and registration

## API Integration

The frontend integrates with the NestJS backend API running on port 3001. All API calls are handled through service modules in `src/services/`.

## Development

- Built with React 18 + TypeScript
- UI components from Material-UI
- State management with React hooks
- API calls with Axios
- Routing with React Router
- Build tool: Vite 