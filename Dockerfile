# Base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and necessary build tools
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-dev \
  build-essential \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

# Set the Python environment variable for npm and node-gyp
ENV PYTHON=/usr/bin/python3

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
