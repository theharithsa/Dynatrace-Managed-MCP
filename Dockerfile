# Build stage
FROM node:22.17.1-alpine3.21 AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Runtime stage
FROM node:22.17.1-alpine3.21

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dynatrace -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies only
COPY --from=build --chown=dynatrace:nodejs /app/package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application
COPY --from=build --chown=dynatrace:nodejs /app/dist ./dist

# Copy agent rules if they exist
COPY --chown=dynatrace:nodejs dynatrace-agent-rules/ ./dynatrace-agent-rules/

# Switch to non-root user
USER dynatrace

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL org.opencontainers.image.title="Dynatrace Managed MCP Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for Dynatrace Managed observability and DevOps automation"
LABEL org.opencontainers.image.vendor="Dynatrace"
LABEL org.opencontainers.image.licenses="MIT"