# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

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

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Production deps + Prisma CLI/client
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --omit=dev --ignore-scripts && npx prisma generate && npm cache clean --force

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Create uploads directory for self-hosted images
RUN mkdir -p /app/uploads

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app/uploads
USER appuser

EXPOSE 5000

CMD ["node", "dist/server.js"]
