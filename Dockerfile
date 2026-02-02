# Step 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы для лучшего кэширования слоев
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Устанавливаем зависимости для сборки
RUN npm ci --include=dev

# Копируем исходный код
COPY src ./src

# Собираем приложение
RUN npm run build

# Удаляем dev-зависимости после сборки
RUN npm prune --production

# Step 2: Runtime Stage  
FROM node:20-alpine

WORKDIR /app

# Создаем непривилегированного пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем только production зависимости и сборку из builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Устанавливаем корректные права
RUN chown -R nodejs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nodejs

EXPOSE 5002

CMD ["node", "dist/main"]