# Multi-stage Dockerfile for vLEI Classifier with workspace dependencies
# Stage 1: Build workspace packages
# Stage 2: Build vlei-classifier app
# Stage 3: Production runner with standalone build

# ============================================================================
# Stage 1: Workspace Builder - Build design-system, sdk-integration, blockchain-infrastructure
# ============================================================================
FROM node:20-alpine AS workspace-builder

# Enable pnpm
RUN corepack enable

# Set working directory to monorepo root
WORKDIR /monorepo

# Copy workspace configuration files from monorepo root
COPY ./pnpm-workspace.yaml ./pnpm-lock.yaml ./package.json ./tsconfig.base.json ./

# Copy all workspace packages from monorepo root
COPY ./packages/ ./packages/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build workspace packages in dependency order
RUN pnpm --filter @design-system-demo/design-system build && \
    pnpm --filter @design-system-demo/sdk-integration build && \
    pnpm --filter @design-system-demo/blockchain-infrastructure build

# ============================================================================
# Stage 2: App Builder - Build vlei-classifier Next.js app
# ============================================================================
FROM node:20-alpine AS app-builder

# Enable pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy built workspace packages and node_modules from stage 1
COPY --from=workspace-builder /monorepo/node_modules ./node_modules
COPY --from=workspace-builder /monorepo/packages ./packages
COPY --from=workspace-builder /monorepo/package.json ./package.json
COPY --from=workspace-builder /monorepo/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=workspace-builder /monorepo/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=workspace-builder /monorepo/tsconfig.base.json ./tsconfig.base.json

# Copy vlei-classifier source code
COPY demos/vlei-classifier/ ./demos/vlei-classifier/

# Change to vlei-classifier directory
WORKDIR /app/demos/vlei-classifier

# Install vlei-classifier dependencies (links workspace packages from /app/packages)
RUN pnpm install --frozen-lockfile

# Build Next.js app in standalone mode
RUN pnpm build

# ============================================================================
# Stage 3: Production Runner - Minimal image with only runtime dependencies
# ============================================================================
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install Docker CLI for container stats monitoring
RUN apk add --no-cache docker-cli

# Don't run as root (but add nextjs user to docker group for socket access)
# Create docker group with GID 987 to match host docker socket permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    addgroup --gid 987 docker && \
    addgroup nextjs docker

# Copy standalone Next.js build output
COPY --from=app-builder --chown=nextjs:nodejs /app/demos/vlei-classifier/.next/standalone ./
COPY --from=app-builder --chown=nextjs:nodejs /app/demos/vlei-classifier/.next/static ./demos/vlei-classifier/.next/static
COPY --from=app-builder --chown=nextjs:nodejs /app/demos/vlei-classifier/public ./demos/vlei-classifier/public

# Switch to non-root user
USER nextjs

# Expose port 4003
EXPOSE 4003

# Set hostname to 0.0.0.0 for Docker networking
ENV HOSTNAME="0.0.0.0"
ENV PORT=4003

# Start Next.js server
CMD ["node", "demos/vlei-classifier/server.js"]
