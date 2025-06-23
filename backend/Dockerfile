FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Install system dependencies
RUN apk update && apk add --no-cache \
    openssl \
    curl \
    netcat-openbsd \
    && rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY package*.json ./

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Make entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app/backend
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
ENTRYPOINT ["sh", "/usr/local/bin/docker-entrypoint.sh"]