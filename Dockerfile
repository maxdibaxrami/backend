# Stage 1: Build the application
FROM ubuntu:22.04 AS build

# Set working directory
WORKDIR /usr/src/app

# Change the repository mirrors to avoid GPG issues
RUN sed -i 's/http:\/\/archive.ubuntu.com/http:\/\/mirror.us.ubuntu.com/g' /etc/apt/sources.list

# Update Ubuntu GPG keys for apt
RUN curl -fsSL https://packages.ubuntu.com/ubuntu-archive-keyring.gpg | tee /etc/apt/trusted.gpg.d/ubuntu.asc

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs \
  && npm install --production \
  && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Runtime environment (production)
FROM ubuntu:22.04

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for production environment
RUN apt-get update --allow-unauthenticated && apt-get install -y \
  curl \
  python3 \
  python3-pip \
  && apt-get clean

# Set the Python environment variable for npm and node-gyp
ENV PYTHON=/usr/bin/python3
ENV NODE_ENV=production

# Copy the production build files from the previous stage
COPY --from=build /usr/src/app /usr/src/app

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
