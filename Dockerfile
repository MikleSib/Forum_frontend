# Stage 1: Build React application
FROM node:20-alpine as build

# Устанавливаем git
RUN apk add --no-cache git

WORKDIR /app

# Клонируем репозиторий
RUN git clone https://github.com/MikleSib/Forum_frontend.git .

# Устанавливаем все зависимости (включая devDependencies)
RUN npm ci

# Собираем приложение
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Копируем собранное приложение (теперь из dist вместо build)
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Добавляем healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80 443

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 