# ---------- Base ----------
  FROM node:22-alpine AS base
  ENV PNPM_HOME="/pnpm"
  ENV PATH="$PNPM_HOME:$PATH"
  RUN corepack enable
  
  # ---------- Dependencias ----------
  FROM base AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile
  
  # ---------- Build ----------
  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN pnpm prisma generate && pnpm build
  
  # ---------- Runner ----------
  FROM node:22-alpine AS runner
  ENV NODE_ENV=production
  ENV PNPM_HOME="/pnpm"
  ENV PATH="$PNPM_HOME:$PATH"
  RUN corepack enable
  
  # Crear usuario no root
  RUN addgroup -S nest && adduser -S nest -G nest
  
  WORKDIR /app
  
  # Copiar archivos necesarios
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --prod --frozen-lockfile
  
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/prisma-entrypoint.sh ./prisma-entrypoint.sh
  COPY --from=builder /app/.env ./.env
  
  # Asignar permisos al usuario nest
  RUN chmod +x prisma-entrypoint.sh && chown -R nest:nest /app
  
  # Generar cliente Prisma como usuario nest
  USER nest
  RUN pnpm prisma generate
  
  EXPOSE 3000
  CMD ["./prisma-entrypoint.sh"]
  