FROM node:12.22.9 as build

WORKDIR /app
RUN npm install -g npm@8.5.1
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY tsconfig.json tsconfig.json
COPY ./public/ ./public
COPY config-overrides.js config-overrides.js
COPY ./src/ ./src
COPY ./nginx/ ./nginx
RUN npm run build

FROM nginx:stable-alpine as production
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]