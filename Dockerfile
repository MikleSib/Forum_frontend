# Stage 1: Build React application
FROM node:20-alpine as build

# Устанавливаем git
RUN apk add --no-cache git

WORKDIR /app

# Клонируем репозиторий
RUN git clone https://github.com/MikleSib/Forum_frontend.git .

# Устанавливаем все зависимости (включая devDependencies)
RUN npm install

# Собираем приложение
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Устанавливаем необходимые пакеты для сборки модулей Nginx
RUN apk add --no-cache \
    build-base \
    linux-headers \
    openssl-dev \
    pcre-dev \
    zlib-dev \
    git \
    cmake \
    g++ \
    make \
    python3

# Устанавливаем модуль brotli
RUN cd /tmp && \
    git clone https://github.com/google/ngx_brotli.git && \
    cd ngx_brotli && \
    git submodule update --init && \
    cd /tmp && \
    wget http://nginx.org/download/nginx-$(nginx -v 2>&1 | sed 's/^nginx version: nginx\///').tar.gz && \
    tar -xzvf nginx-$(nginx -v 2>&1 | sed 's/^nginx version: nginx\///').tar.gz && \
    cd nginx-$(nginx -v 2>&1 | sed 's/^nginx version: nginx\///') && \
    ./configure --with-compat --add-dynamic-module=/tmp/ngx_brotli && \
    make modules && \
    cp objs/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/ && \
    cp objs/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/ && \
    cd / && \
    rm -rf /tmp/*

# Создаем директорию для модулей
RUN mkdir -p /etc/nginx/modules

# Добавляем загрузку модулей в конфигурацию
RUN echo "load_module /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so;" > /etc/nginx/modules/50-mod-http-brotli-filter.conf && \
    echo "load_module /usr/lib/nginx/modules/ngx_http_brotli_static_module.so;" > /etc/nginx/modules/51-mod-http-brotli-static.conf

# Копируем собранное приложение (из build, как указано в vite.config.ts)
COPY --from=build /app/build /usr/share/nginx/html/Forum

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Добавляем healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80 443

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 