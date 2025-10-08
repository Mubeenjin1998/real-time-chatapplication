# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Use a clean install to ensure dependencies match lockfile
RUN npm ci --only=production

# Bundle app source
COPY . .

# Your app binds to port 3000, so you need to expose it
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "server.js" ]