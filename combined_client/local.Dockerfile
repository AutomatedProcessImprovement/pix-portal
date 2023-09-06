# Stage 1: Build the Vite project
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package.json
COPY package-lock.json package-lock.json

# Install dependencies
RUN npm ci

COPY tsconfig.json tsconfig.json
COPY tsconfig.node.json tsconfig.node.json
COPY authConfig.ts authConfig.ts
COPY vite.config.ts vite.config.ts
COPY index.html index.html

# TODO CHOOSE WHICH .env YOU NEED.

COPY .env.development .env.production
COPY ./public/ ./public
COPY ./src/ ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the production-ready Nginx server
FROM nginx:1.21

# Copy the built Vite files from the previous stage to the Nginx container
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file to the container
COPY nginx/local.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]