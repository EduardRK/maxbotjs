
# Запуск сервиса на windows

```bash
git clone https://github.com/EduardRK/maxbotjs

cd maxbotjs

docker-compose up -d

cd backend

npm install

npm run init-db

npm run dev

cd frontend

npm install

npm run dev
```

# Запуск сервиса на linux (ubuntu)

```bash
git clone https://github.com/EduardRK/maxbotjs

cd maxbotjs

docker-compose up -d

cd backend

npm install

chmod +x node_modules/.bin/vite

npm run init-db

npm run dev

cd ../frontend

npm install

chmod +x node_modules/.bin/*

npm run dev
```
