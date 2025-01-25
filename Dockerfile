# Stage 1: Build the application
FROM node:18 AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and necessary build tools
RUN apt-get update && apt-get install -y gnupg2 curl \
  && curl -fsSL https://ftp-master.debian.org/keys/archive-key-10.asc | tee /etc/apt/trusted.gpg.d/debian.asc \
  && apt-get update \
  && apt-get install -y python3 python3-pip python3-dev build-essential \
  libcairo2-dev libjpeg-dev libpango1.0-dev librsvg2-dev \
  && npm install --production \
  && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Runtime environment (production)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Set the Python environment variable for npm and node-gyp
ENV PYTHON=/usr/bin/python3
ENV NODE_ENV=production

# Copy the production build files from the previous stage
COPY --from=build /usr/src/app /usr/src/app

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
