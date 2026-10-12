# Multi-stage build for React + Vite frontend

# ============================================
# Development Stage
# ============================================
FROM node:20-alpine as development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies. The repository currently combines Storybook 8 packages
# with eslint-plugin-storybook 10, which is lint-only and has an incompatible
# peer declaration; preserve the manifest and allow npm to install the dev app.
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]

# ============================================
# Build Stage
# ============================================
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM nginx:alpine as production

# Copy custom nginx config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
