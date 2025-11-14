FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

RUN echo '#!/bin/sh\n\
until nc -z postgres 5432; do\n\
  echo "🕐 Waiting for PostgreSQL..."\n\
  sleep 2\n\
done\n\
echo "✅ PostgreSQL is ready!"\n\
npm run init-db\n\
npm start' > /app/start.sh && chmod +x /app/start.sh

RUN apk add --no-cache netcat-openbsd
EXPOSE 3001
CMD ["/bin/sh", "/app/start.sh"]