# frontend/Dockerfile

# ---------
# 1) Build stage
# ---------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ---------
# 2) Runtime stage (Nginx)
# ---------
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx default port
EXPOSE 80

# Use default nginx entrypoint/cmd (serves /usr/share/nginx/html)
