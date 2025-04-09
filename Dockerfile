# Step 1: Build Stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Step 2: Runtime Stage
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Add community repository and install dependencies for Puppeteer and Chromium
RUN apk update && apk add --no-cache \
    chromium \
    chromium-chromedriver \
    libnss3-dev \
    libgconf \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups \
    libdbus \
    libgdk-pixbuf \
    libnspr \
    libxss \
    libxtst \
    xdg-utils \
    fonts-liberation \
    && rm -rf /var/cache/apk/*

# Set the environment variable for Puppeteer to use Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy only the built files and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Expose the application's port (change if needed)
EXPOSE 5002

# Start the application
CMD ["node", "dist/main"]
