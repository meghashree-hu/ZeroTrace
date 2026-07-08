# -----------------------------
# Stage 1 - Build Application
# -----------------------------
FROM node:22-alpine AS builder

# Create working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project source
COPY . .

# Compile TypeScript
RUN npm run build


# -----------------------------
# Stage 2 - Production Image
# -----------------------------
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy uploads folder


# Application Port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]