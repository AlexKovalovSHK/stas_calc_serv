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

# Install Chromium and required dependencies for Puppeteer
RUN apk add --no-cache \
  chromium \
  libnss3 \
  libgconf-2-4 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libxss1 \
  libxtst6 \
  xdg-utils \
  fonts-liberation

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
