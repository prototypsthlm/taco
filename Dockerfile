# Step 1: Use a base image with Node.js
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Copy initialize.js to avoid crash when runing the postinstall script after npm ci
COPY initialize.js ./

# Install dependencies
RUN npm ci

# Copy the rest of your application's code
COPY . .

RUN npx prisma generate

# Build your application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "run", "container"]
