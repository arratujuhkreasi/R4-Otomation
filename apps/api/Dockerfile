# ============================================
# FlowAutomator API - Production Dockerfile
# ============================================
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN npm ci --workspace=apps/api --workspace=packages/shared-types

# Copy source
COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types
COPY tsconfig.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN npm run build --workspace=apps/api

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Security: Run as non-root
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
