# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8087
ARG VITE_PAYMENT_BASIC=cGF5bWVudC11c2VyOnBheW1lbnQtcGFzcw==
ARG VITE_USE_MOCK_PAYMENT_PAGE=true
ARG VITE_ADMIN_USERNAME=admin
ARG VITE_ADMIN_PASSWORD=admin-pass
ARG VITE_TMDB_API_KEY=
ARG VITE_TMDB_ACCESS_TOKEN=

# Set environment variables at build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PAYMENT_BASIC=$VITE_PAYMENT_BASIC
ENV VITE_USE_MOCK_PAYMENT_PAGE=$VITE_USE_MOCK_PAYMENT_PAGE
ENV VITE_ADMIN_USERNAME=$VITE_ADMIN_USERNAME
ENV VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_TMDB_ACCESS_TOKEN=$VITE_TMDB_ACCESS_TOKEN

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
