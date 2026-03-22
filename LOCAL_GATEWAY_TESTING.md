# Local Gateway Testing Guide

## Overview

This guide provides comprehensive instructions for testing the local API Gateway setup with remote Azure Container Apps services. The testing setup allows you to run the API Gateway and Frontend locally while routing requests to backend services deployed on Azure.

### Architecture

```
Frontend (Local) → API Gateway (Local) → Remote Azure Services
   (localhost:5173)    (localhost:8087)    (Azure Container Apps)
```

### Configuration Summary

- **Frontend**: Points to local gateway at `http://localhost:8087`
- **API Gateway**: Runs locally on port 8087, routes to Azure services
- **Backend Services**: Deployed on Azure Container Apps

## Prerequisites

### Azure Services (Must Be Running)

Ensure the following Azure Container Apps are deployed and accessible:

| Service | Azure URL |
|---------|-----------|
| User Service | `https://user-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io` |
| Booking Service | `https://booking-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io` |
| Movie Service | `https://movie-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io` |
| Scheduling Service | `https://scheduling-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io` |
| Payment Service | `https://payment-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io` |

### Local Requirements

- **Java 17** or higher installed
- **Maven** installed and configured
- **Node.js** (v18 or higher) and **npm** installed
- **Git** for version control

### Configuration Files

Verify the following configurations are correct:

#### Frontend Configuration ([`Frontend/.env`](Frontend/.env:1))
```env
VITE_API_BASE_URL=http://localhost:8087
```

#### Gateway Configuration ([`Gateway/api-gateway/src/main/resources/application.yml`](Gateway/api-gateway/src/main/resources/application.yml:1))
The gateway is configured to route to Azure services with fallback URLs.

## Step-by-Step Testing Procedure

### Step 1: Verify Azure Services Are Accessible

Before starting local components, verify that all Azure services are running and accessible.

**Actions:**
1. Open a web browser or use curl to test each service:
   ```bash
   curl https://user-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   curl https://booking-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   curl https://movie-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   curl https://scheduling-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   curl https://payment-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   ```

2. Verify each service returns a healthy status (HTTP 200)

**Expected Result:** All services respond with HTTP 200 and healthy status

---

### Step 2: Start the API Gateway Locally

Start the Spring Boot API Gateway that will route requests to Azure services.

**Actions:**
1. Navigate to the gateway directory:
   ```bash
   cd Gateway/api-gateway
   ```

2. Build the project (if not already built):
   ```bash
   mvn clean install
   ```

3. Run the gateway:
   ```bash
   mvn spring-boot:run
   ```

**Expected Result:**
- Gateway starts successfully on port 8087
- Console shows: `Started ApiGatewayApplication in X.XXX seconds`
- No errors in startup logs

**Gateway Logs to Monitor:**
```
Mapping registered: GET /users/** -> https://user-service-app...
Mapping registered: GET /booking/** -> https://booking-service-app...
Mapping registered: GET /movies/** -> https://movie-service-app...
Mapping registered: GET /schedules/** -> https://scheduling-service-app...
Mapping registered: GET /payments/** -> https://payment-service-app...
```

---

### Step 3: Verify Gateway Connectivity

Test that the gateway is running and can route requests to Azure services.

**Actions:**
1. Open a new terminal (keep gateway running)
2. Test gateway health:
   ```bash
   curl http://localhost:8087/actuator/health
   ```

3. Test routing to each service through the gateway:
   ```bash
   # Test user service
   curl http://localhost:8087/users/actuator/health
   
   # Test booking service
   curl http://localhost:8087/booking/actuator/health
   
   # Test movie service
   curl http://localhost:8087/movies/actuator/health
   
   # Test scheduling service
   curl http://localhost:8087/schedules/actuator/health
   
   # Test payment service
   curl http://localhost:8087/payments/actuator/health
   ```

**Expected Result:**
- All requests return HTTP 200
- Gateway logs show successful routing to Azure services
- Response times are reasonable (< 2 seconds)

**Gateway Logs to Look For:**
```
org.springframework.cloud.gateway.handler.RoutePredicateHandlerMapping : Route matched: user-service
org.springframework.cloud.gateway.handler.RoutePredicateHandlerMapping : Mapping [Exchange: GET ...] to Route{id='user-service', uri=https://user-service-app...}
```

---

### Step 4: Start the Frontend Locally

Start the React frontend that will communicate with the local gateway.

**Actions:**
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

**Expected Result:**
- Frontend starts successfully
- Console shows: `Local: http://localhost:5173/`
- No build errors

---

### Step 5: Test Frontend-to-Gateway Connectivity

Verify that the frontend can communicate with the local gateway.

**Actions:**
1. Open a web browser and navigate to: `http://localhost:5173`

2. Open Browser DevTools (F12) and go to the **Network** tab

3. Navigate through the application to trigger API calls:
   - Browse to the movie list page
   - View movie details
   - Check schedules

**Expected Result:**
- Application loads without errors
- Network tab shows requests to `http://localhost:8087`
- All API requests return HTTP 200 or appropriate status codes
- No CORS errors in console

**Network Tab Verification:**
- Look for requests to: `http://localhost:8087/movies/*`
- Look for requests to: `http://localhost:8087/schedules/*`
- Verify response status codes are green (200-299)

---

### Step 6: End-to-End Testing Flow

Perform a complete user journey to verify the entire system works correctly.

**Test Scenario 1: Browse Movies**

1. Navigate to the home page
2. Browse available movies
3. Click on a movie to view details

**Verification:**
- Movies load successfully
- Movie details display correctly
- Gateway logs show: `GET /movies/*` requests routed to Azure

**Test Scenario 2: View Schedules**

1. Select a movie
2. View available schedules
3. Check seat availability

**Verification:**
- Schedules load successfully
- Seat information displays correctly
- Gateway logs show: `GET /schedules/*` requests routed to Azure

**Test Scenario 3: User Registration and Login**

1. Navigate to the registration page
2. Create a new user account
3. Login with the new account

**Verification:**
- User registration succeeds
- Login succeeds
- Gateway logs show: `POST /users/register` and `POST /users/login` requests

**Test Scenario 4: Create Booking**

1. Login as a user
2. Select a movie and schedule
3. Choose seats
4. Create a booking

**Verification:**
- Booking creation succeeds
- Booking confirmation displays
- Gateway logs show: `POST /booking/*` requests routed to Azure

**Test Scenario 5: Payment Processing**

1. Proceed to payment after booking
2. Complete payment flow
3. Verify payment success

**Verification:**
- Payment processes successfully
- Payment confirmation displays
- Gateway logs show: `POST /payments/*` requests routed to Azure

---

## Verification Checkpoints

### Gateway Logs Verification

Monitor the gateway console for the following indicators:

**✅ Successful Startup:**
```
Started ApiGatewayApplication in X.XXX seconds (JVM running for X.XXX)
Netty started on port 8087
```

**✅ Successful Routing:**
```
Route matched: user-service
Mapping [Exchange: GET ...] to Route{id='user-service', uri=https://user-service-app...}
```

**✅ CORS Configuration:**
```
Adding CORS to response
```

**❌ Error Indicators:**
```
Connection refused
503 Service Unavailable
Unable to connect to remote service
```

### Browser DevTools Verification

**Network Tab:**
- ✅ All requests to `http://localhost:8087` return 200-299 status
- ✅ Request headers include proper CORS headers
- ✅ Response times are reasonable (< 2 seconds)
- ❌ No failed requests (red status codes)
- ❌ No CORS errors

**Console Tab:**
- ✅ No JavaScript errors
- ✅ No network errors
- ❌ No "Access-Control-Allow-Origin" errors

### Azure Service Verification

**Health Checks:**
- ✅ All Azure services respond to `/actuator/health` with 200
- ✅ Services show "UP" status
- ❌ No services showing "DOWN" or error status

**Response Times:**
- ✅ Gateway-to-Azure response times < 2 seconds
- ❌ Response times consistently > 5 seconds (indicates network issues)

## Troubleshooting Guide

### Issue 1: Gateway Fails to Start

**Symptoms:**
- Port 8087 already in use
- Maven build errors
- Java version mismatch

**Solutions:**

1. **Port Already in Use:**
   ```bash
   # Windows
   netstat -ano | findstr :8087
   taskkill /PID <PID> /F
   
   # Or change port in application.yml
   server:
     port: 8088
   ```

2. **Maven Build Errors:**
   ```bash
   # Clean and rebuild
   cd Gateway/api-gateway
   mvn clean install -U
   ```

3. **Java Version Check:**
   ```bash
   java -version
   # Ensure Java 17 or higher is installed
   ```

---

### Issue 2: Gateway Cannot Connect to Azure Services

**Symptoms:**
- 503 Service Unavailable errors
- Connection timeout errors
- Gateway logs show connection failures

**Solutions:**

1. **Verify Azure Services Are Running:**
   ```bash
   # Test direct connection to Azure services
   curl https://user-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
   ```

2. **Check Network Connectivity:**
   - Verify internet connection
   - Check firewall settings
   - Ensure no VPN is blocking connections

3. **Verify Gateway Configuration:**
   - Check [`application.yml`](Gateway/api-gateway/src/main/resources/application.yml:1) for correct Azure URLs
   - Ensure environment variables are set if using overrides

4. **Enable Debug Logging:**
   Add to [`application.yml`](Gateway/api-gateway/src/main/resources/application.yml:1):
   ```yaml
   logging:
     level:
       org.springframework.cloud.gateway: DEBUG
       org.springframework.web.reactive: DEBUG
   ```

---

### Issue 3: Frontend Cannot Connect to Gateway

**Symptoms:**
- CORS errors in browser console
- Network requests fail
- "Network Error" messages

**Solutions:**

1. **Verify Gateway is Running:**
   ```bash
   curl http://localhost:8087/actuator/health
   ```

2. **Check Frontend Configuration:**
   - Verify [`Frontend/.env`](Frontend/.env:1) has `VITE_API_BASE_URL=http://localhost:8087`
   - Restart frontend after changing `.env`

3. **Verify CORS Configuration:**
   - Check gateway [`application.yml`](Gateway/api-gateway/src/main/resources/application.yml:27) CORS settings
   - Ensure `http://localhost:*` is in `allowedOriginPatterns`

4. **Clear Browser Cache:**
   - Clear browser cache and cookies
   - Try in incognito/private mode

---

### Issue 4: Slow Response Times

**Symptoms:**
- Requests take > 5 seconds
- Application feels sluggish
- Timeout errors

**Solutions:**

1. **Check Azure Service Performance:**
   - Test Azure services directly (bypass gateway)
   - Compare response times

2. **Check Network Latency:**
   ```bash
   # Ping Azure services
   ping user-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io
   ```

3. **Monitor Gateway Logs:**
   - Look for slow route matching
   - Check for connection pool exhaustion

4. **Optimize Gateway Configuration:**
   - Increase connection timeouts if needed
   - Consider adding caching for frequently accessed data

---

### Issue 5: Authentication/Authorization Failures

**Symptoms:**
- 401 Unauthorized errors
- 403 Forbidden errors
- Login failures

**Solutions:**

1. **Verify JWT Configuration:**
   - Check JWT secret keys match between services
   - Verify token expiration times

2. **Test Authentication Flow:**
   - Use browser DevTools to inspect JWT tokens
   - Verify tokens are being sent in Authorization headers

3. **Check Service-Specific Auth:**
   - Verify each service's security configuration
   - Ensure user roles are properly set

---

### Issue 6: Payment Processing Failures

**Symptoms:**
- Payment creation fails
- Payment status not updating
- Stripe integration errors

**Solutions:**

1. **Verify Payment Service Configuration:**
   - Check Stripe API keys
   - Verify webhook URLs

2. **Test Payment Service Directly:**
   ```bash
   curl -X POST http://localhost:8087/payments \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic cGF5bWVudC11c2VyOnBheW1lbnQtcGFzcw==" \
     -d '{"bookingId": "test", "amount": 1000}'
   ```

3. **Check Payment Gateway Logs:**
   - Look for Stripe API errors
   - Verify webhook signatures

---

## Quick Reference Commands

### Gateway Commands

```bash
# Navigate to gateway
cd Gateway/api-gateway

# Build gateway
mvn clean install

# Run gateway
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Check gateway health
curl http://localhost:8087/actuator/health
```

### Frontend Commands

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Commands

```bash
# Test all Azure services
for service in user booking movie scheduling payment; do
  echo "Testing $service service..."
  curl https://${service}-service-app.mangohill-a3908265.southeastasia.azurecontainerapps.io/actuator/health
  echo ""
done

# Test gateway routing
curl http://localhost:8087/users/actuator/health
curl http://localhost:8087/booking/actuator/health
curl http://localhost:8087/movies/actuator/health
curl http://localhost:8087/schedules/actuator/health
curl http://localhost:8087/payments/actuator/health
```

## Success Criteria

The local gateway testing setup is working correctly when:

- ✅ Gateway starts successfully on port 8087
- ✅ Frontend starts successfully on port 5173
- ✅ All Azure services are accessible and healthy
- ✅ Gateway successfully routes requests to Azure services
- ✅ Frontend can communicate with gateway without CORS errors
- ✅ Complete user journey (browse → book → pay) works end-to-end
- ✅ Response times are acceptable (< 2 seconds for most operations)
- ✅ No errors in gateway logs or browser console

## Additional Resources

- [Spring Cloud Gateway Documentation](https://spring.io/projects/spring-cloud-gateway)
- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [React Documentation](https://react.dev/)
- [Project README](README.md)

## Support

If you encounter issues not covered in this guide:

1. Check the gateway logs for detailed error messages
2. Inspect browser DevTools for client-side errors
3. Verify Azure Container Apps logs in the Azure Portal
4. Review the main project documentation in [`README.md`](README.md:1)

---

**Last Updated:** 2026-03-22  
**Version:** 1.0  
**Maintained By:** Development Team
