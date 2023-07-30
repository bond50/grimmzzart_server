# Use an official Node.js runtime as the base image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app files to the working directory
COPY . .

# Expose port 3000, the default for Node.js apps
EXPOSE 8000

# Run the command to start the app
CMD [ "npm", "start" ]
