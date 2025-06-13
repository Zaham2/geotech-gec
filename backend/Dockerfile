FROM node:20-alpine

# Set working directory
WORKDIR /app
RUN apk update
RUN apk add openssl

# Copy package files
COPY package*.json ./

# Copy source code
COPY . . 

# Install NestJS CLI
RUN npm install -g @nestjs/cli

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"] 