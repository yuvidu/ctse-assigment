package com.praboth.api_gateway.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Filter to strip CORS headers from downstream services to prevent duplicate headers.
 * The filter adds the gateway's own CORS headers to the response.
 */
@Component
public class CorsHeaderFilter implements GlobalFilter, Ordered {

    private static final List<String> CORS_HEADERS_TO_STRIP = List.of(
            HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
            HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS,
            HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
            HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
            HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
            HttpHeaders.ACCESS_CONTROL_MAX_AGE,
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Methods",
            "Access-Control-Expose-Headers",
            "Access-Control-Max-Age"
    );

    // Allowed origins matching the globalcors configuration
    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:*",
            "https://*.netlify.app",
            "https://mangohill-*.azurecontainerapps.io"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();
            ServerHttpRequest request = exchange.getRequest();
            
            // Get the Origin header from the request
            String origin = request.getHeaders().getFirst(HttpHeaders.ORIGIN);
            
            // Log CORS headers before stripping
            System.out.println("=== CORS HEADER FILTER DEBUG ===");
            System.out.println("Filter Order: " + getOrder());
            System.out.println("Request Path: " + request.getPath());
            System.out.println("Request Origin: " + origin);
            System.out.println("CORS Headers BEFORE stripping:");
            CORS_HEADERS_TO_STRIP.forEach(headerName -> {
                List<String> values = headers.get(headerName);
                if (values != null && !values.isEmpty()) {
                    System.out.println("  " + headerName + ": " + values);
                }
            });
            
            // Remove all CORS headers from the downstream response
            CORS_HEADERS_TO_STRIP.forEach(headers::remove);
            
            // Add gateway's CORS headers if origin is allowed
            if (origin != null && isOriginAllowed(origin)) {
                System.out.println("Adding gateway CORS headers for origin: " + origin);
                headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
                headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS");
                headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "*");
            } else {
                System.out.println("Origin not allowed or missing: " + origin);
            }
            
            // Log CORS headers after stripping and adding
            System.out.println("CORS Headers AFTER processing:");
            CORS_HEADERS_TO_STRIP.forEach(headerName -> {
                List<String> values = headers.get(headerName);
                if (values != null && !values.isEmpty()) {
                    System.out.println("  " + headerName + ": " + values);
                }
            });
            System.out.println("=== END CORS HEADER FILTER DEBUG ===");
        }));
    }

    /**
     * Check if the origin is allowed based on the configured patterns.
     */
    private boolean isOriginAllowed(String origin) {
        for (String pattern : ALLOWED_ORIGINS) {
            if (pattern.equals("*")) {
                return true;
            }
            if (pattern.contains("*")) {
                // Convert pattern to regex
                String regex = pattern.replace(".", "\\.").replace("*", ".*");
                if (origin.matches(regex)) {
                    return true;
                }
            } else if (pattern.equals(origin)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public int getOrder() {
        // Run after the response has been received from downstream service
        // but before the response is sent to the client
        return Ordered.LOWEST_PRECEDENCE - 1;
    }
}
