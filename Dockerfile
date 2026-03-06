FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm ci --ignore-scripts

COPY vite.config.js tsconfig.json ./
COPY resources/ resources/

ARG VITE_APP_NAME=Dumphere
ARG VITE_YJS_WS_HOST=localhost
ARG VITE_YJS_WS_PORT=1234
ARG VITE_YJS_WS_SCHEME=ws
ARG VITE_YJS_WS_PATH=

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_YJS_WS_HOST=$VITE_YJS_WS_HOST \
    VITE_YJS_WS_PORT=$VITE_YJS_WS_PORT \
    VITE_YJS_WS_SCHEME=$VITE_YJS_WS_SCHEME \
    VITE_YJS_WS_PATH=$VITE_YJS_WS_PATH

RUN npm run build

FROM composer:2 AS composer-deps

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --no-dev

FROM php:8.3-fpm-alpine AS production

RUN apk add --no-cache \
    libpq-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    curl

RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    intl \
    mbstring \
    opcache \
    zip \
    bcmath \
    pcntl

RUN apk add --no-cache --virtual .phpize-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .phpize-deps

COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-production.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-production.conf

WORKDIR /var/www/html

COPY --from=composer-deps /app/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN cp -r public /tmp/public-build

RUN rm -rf \
    .env \
    .env.* \
    .git \
    .gitignore \
    tests \
    docker \
    node_modules \
    storage/logs/*.log \
    storage/framework/sessions/* \
    storage/framework/cache/data/*

RUN chown -R www-data:www-data /var/www/html \
    && chown -R www-data:www-data /tmp/public-build \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
