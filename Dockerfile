# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Set API URL for production (browser will call nginx, which proxies to backend)
ENV NEXT_PUBLIC_API_URL=http://8.134.128.64:7690

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
