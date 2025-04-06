# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Install typescript globally
RUN npm install -g typescript ts-node

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on (example: 3000)
EXPOSE 5000

# Run the app in development mode with nodemon
CMD ["npx", "nodemon", "src/server.ts"]