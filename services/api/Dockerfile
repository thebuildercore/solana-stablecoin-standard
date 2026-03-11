# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency files first (optimizes Docker caching)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile the TypeScript code
RUN npm run build

# Expose the port the API runs on
EXPOSE 3000

# The command to start the server
CMD ["npm", "start"]