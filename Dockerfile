# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++ 

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:prod"]
