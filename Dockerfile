# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install Python, build tools, and dependencies for canvas
RUN apk add --no-cache python3 make g++ pkg-config cairo-dev pango-dev pixman-dev

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
