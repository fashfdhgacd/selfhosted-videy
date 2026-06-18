# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Prisma
COPY prisma ./prisma
RUN npx prisma generate

# App
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache ffmpeg

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules

# Create uploads dir
RUN mkdir -p uploads/videos uploads/thumbnails

EXPOSE 3000
CMD ["node", "server.js"]
