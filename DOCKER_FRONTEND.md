# Frontend Docker Deployment Guide

This guide covers building and deploying the Frontend (Vite React application) using Docker.

## Overview

The Frontend is a Vite-based React application that serves as the user interface for the cinema booking system. It communicates with the API Gateway for all backend operations.

## Docker Configuration

### Files Created/Updated

- **[`Frontend/Dockerfile`](Frontend/Dockerfile)** - Multi-stage Dockerfile for building and serving the React app
- **[`Frontend/.dockerignore`](Frontend/.dockerignore)** - Excludes unnecessary files from Docker build context
- **[`docker-compose.yml`](docker-compose.yml)** - Updated with frontend service configuration

## Building the Docker Image

### Build with Docker Compose (Recommended)

```bash
docker-compose build frontend
```

### Build with Docker CLI

```bash
cd Frontend
docker build -t cinema-frontend:latest .
```

### Build with Custom Environment Variables

For production deployment, you may need to override the default environment variables:

```bash
docker-compose build frontend --build-arg VITE_API_BASE_URL=https://api-gateway-app.mangohill-a3908265.southeastasia.azurecontainerapps.io
```

Or with Docker CLI:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api-gateway-app.mangohill-a3908265.southeastasia.azurecontainerapps.io \
  --build-arg VITE_PAYMENT_BASIC=cGF5bWVudC11c2VyOnBheW1lbnQtcGFzcw== \
  --build-arg VITE_USE_MOCK_PAYMENT_PAGE=true \
  --build-arg VITE_ADMIN_USERNAME=admin \
  --build-arg VITE_ADMIN_PASSWORD=admin-pass \
  --build-arg VITE_TMDB_API_KEY=your_tmdb_api_key \
  --build-arg VITE_TMDB_ACCESS_TOKEN=your_tmdb_access_token \
  -t cinema-frontend:latest .
```

## Running the Container

### Run with Docker Compose (Recommended)

```bash
docker-compose up frontend
```

To run in detached mode:

```bash
docker-compose up -d frontend
```

### Run with Docker CLI

```bash
docker run -d -p 3000:80 --name cinema-frontend cinema-frontend:latest
```

## Environment Variables

The following build-time environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API Gateway URL | `http://localhost:8087` |
| `VITE_PAYMENT_BASIC` | Base64 encoded payment credentials | `cGF5bWVudC11c2VyOnBheW1lbnQtcGFzcw==` |
| `VITE_USE_MOCK_PAYMENT_PAGE` | Enable mock payment page | `true` |
| `VITE_ADMIN_USERNAME` | Admin username | `admin` |
| `VITE_ADMIN_PASSWORD` | Admin password | `admin-pass` |
| `VITE_TMDB_API_KEY` | TMDB API key for movie data | (empty) |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB access token | (empty) |

### Important Notes

- These variables are **build-time** variables and are baked into the production bundle
- For Azure Container Apps deployment, set these as build arguments during image build
- The `VITE_` prefix is required for Vite to expose these variables to the frontend

## Port Mappings

| Container Port | Host Port | Description |
|----------------|-----------|-------------|
| 80 | 3000 | HTTP (nginx) |

Access the frontend at: `http://localhost:3000`

## Docker Compose Service Details

The frontend service in [`docker-compose.yml`](docker-compose.yml) includes:

```yaml
frontend:
  build:
    context: ./Frontend
    args:
      - VITE_API_BASE_URL=http://localhost:8087
      - VITE_PAYMENT_BASIC=cGF5bWVudC11c2VyOnBheW1lbnQtcGFzcw==
      - VITE_USE_MOCK_PAYMENT_PAGE=true
      - VITE_ADMIN_USERNAME=admin
      - VITE_ADMIN_PASSWORD=admin-pass
      - VITE_TMDB_API_KEY=73883ebdfd5455234a4b1970fd7f8d5e
      - VITE_TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
  ports:
    - "3000:80"
  depends_on:
    - api-gateway
  networks:
    - app-network
```

## Deployment to Azure Container Apps

### Prerequisites

1. Azure CLI installed and configured
2. Azure Container Registry (ACR) or Docker Hub account
3. Azure Container Apps environment

### Steps

1. **Build and push the image to a registry:**

```bash
# Tag for Azure Container Registry
docker tag cinema-frontend:latest <your-registry>.azurecr.io/cinema-frontend:latest

# Push to registry
docker push <your-registry>.azurecr.io/cinema-frontend:latest
```

2. **Create the Container App:**

```bash
az containerapp create \
  --name frontend-app \
  --resource-group <your-resource-group> \
  --environment <your-environment> \
  --image <your-registry>.azurecr.io/cinema-frontend:latest \
  --target-port 80 \
  --ingress external \
  --registry-server <your-registry>.azurecr.io \
  --registry-username <registry-username> \
  --registry-password <registry-password>
```

3. **Configure environment variables (if needed):**

For Azure Container Apps, environment variables should be set as build arguments during image creation, as they are build-time variables for Vite.

## Health Check

The Dockerfile includes a health check that monitors the nginx server:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
```

## Troubleshooting

### Build Issues

If the build fails, ensure:
- Node.js 18 is available (via the `node:18-alpine` base image)
- All dependencies are correctly listed in [`package.json`](Frontend/package.json)
- The build script `npm run build` works locally

### Runtime Issues

If the container starts but the app doesn't load:
- Check nginx logs: `docker logs cinema-frontend`
- Verify the build output exists in `/usr/share/nginx/html`
- Ensure port 3000 is not already in use

### Environment Variables Not Working

Remember that `VITE_` prefixed variables are **build-time** only. If you need to change them:
1. Rebuild the image with new build arguments
2. Redeploy the container

## Development vs Production

### Development

For local development, use the standard Vite dev server:

```bash
cd Frontend
npm install
npm run dev
```

### Production

For production deployment, use Docker:

```bash
docker-compose up -d frontend
```

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
