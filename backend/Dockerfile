# backend/Dockerfile

# 1. Use a small, official Node.js image.
FROM node:20-alpine AS base

# 2. Set working directory inside the container.
WORKDIR /app

# 3. Copy only package files first (for better layer caching).
COPY package*.json ./

# 4. Install production dependencies (no dev dependencies in final image).
#    For development images you might include dev dependencies, but for deployment we keep it slim.
RUN npm install --only=production

# 5. Copy the rest of the source code.
COPY src ./src

# 6. Expose the port (for documentation purposes; Kubernetes uses this info).
EXPOSE 4000

# 7. Define environment variable for Node env (defaults to production).
ENV NODE_ENV=production

# 8. Start the application.
CMD ["node", "src/index.js"]
