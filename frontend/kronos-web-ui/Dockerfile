FROM node:slim

WORKDIR /app

COPY . ./
RUN npm install --legacy-peer-deps
RUN npm run build

EXPOSE 3000

RUN npm install serve
CMD ["serve", "-s", "build", "-l", "3000"]