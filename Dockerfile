# Base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and necessary build tools
RUN apt-get update && apt-get install -y gnupg2 curl \
  && curl -fsSL https://ftp-master.debian.org/keys/archive-key-10.asc | tee /etc/apt/trusted.gpg.d/debian.asc \
  && apt-get update

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
