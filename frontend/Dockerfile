# syntax=docker/dockerfile:1

# --- STAGE 1: BUILDER ---
FROM node:22-alpine AS build
WORKDIR /app

# Habilitar corepack para usar pnpm con pnpm-lock.yaml (Factor II)
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

COPY . .
RUN pnpm run build

# --- STAGE 2: RUNTIME ---
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Copiar artefactos compilados de Angular
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]