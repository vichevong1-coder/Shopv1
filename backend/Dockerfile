# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy Prisma schema & generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Copy mock-images into dist (tsc only compiles .ts files, not assets)
RUN cp -r src/seeders/mock-images dist/seeders/mock-images

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Production deps + Prisma CLI/client
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --omit=dev --ignore-scripts && npx prisma generate && npm cache clean --force

# Copy compiled output (includes mock-images for seeder)
COPY --from=builder /app/dist ./dist

# Copy startup entrypoint
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Create uploads directory for self-hosted images (will be mounted as volume in production)
RUN mkdir -p /app/uploads

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app/uploads /app/docker-entrypoint.sh
USER appuser

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
