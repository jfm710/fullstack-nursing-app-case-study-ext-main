# Stage 1: Build the frontend application
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
# This leverages Docker's cache. These layers are only rebuilt if these files change.
COPY package.json ./

# Install dependencies
# If using npm:
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This will create the 'dist' folder
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy your custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output (the 'dist' folder) from the 'builder' stage to Nginx's web root
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx and keep it in the foreground
CMD ["nginx", "-g", "daemon off;"]