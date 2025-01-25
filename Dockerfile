# Stage 1: Build the application

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

# Copy the rest of the application code# Stage 1: Build the application

# Set working directory
WORKDIR /usr/src/app

# Install dependencies and necessary build tools
RUN apt-get update && apt-get install -y \
  gnupg2 \
  curl \
  python3 \
  python3-pip \
  python3-dev \
  build-essential \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  librsvg2-dev \
  git \
  && apt-get clean

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
RUN apt-get update && apt-get install -y \
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

COPY . .

# Build the NestJS app
RUN npm run build


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
