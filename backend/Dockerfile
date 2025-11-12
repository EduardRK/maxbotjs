FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем скрипт для ожидания базы и инициализации
RUN echo '#!/bin/sh\n\
until nc -z postgres 5432; do\n\
  echo "🕐 Waiting for PostgreSQL..."\n\
  sleep 2\n\
done\n\
echo "✅ PostgreSQL is ready!"\n\
npm run init-db\n\
npm start' > /app/start.sh && chmod +x /app/start.sh

# Устанавливаем netcat для проверки порта
RUN apk add --no-cache netcat-openbsd

EXPOSE 3001

CMD ["/bin/sh", "/app/start.sh"]