# -----------------------------
# Stage 1 - Build Application
# -----------------------------
FROM node:22-alpine AS builder

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# -----------------------------
# Stage 2 - Production Image
# -----------------------------
FROM node:22-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create uploads directory and assign permissions
RUN mkdir -p uploads \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]