# Multi-stage Dockerfile para TFI-NEXUS Backend (NestJS + Prisma + Supabase)
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias completas para compilación
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Generar cliente de Prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copiar código fuente y compilar NestJS
COPY . .
RUN npm run build

# Imagen ligera de producción
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Instalar únicamente dependencias requeridas en producción
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copiar cliente de Prisma generado y binarios compilados
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main.js"]
