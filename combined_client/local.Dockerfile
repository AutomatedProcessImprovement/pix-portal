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

COPY .env.development .env.development
COPY ./public/ ./public
COPY ./src/ ./src

# Install the npm packages
CMD [ "npm", "install" ]
# Run the container in DEV mode
CMD [ "npm", "run", "dev" ]