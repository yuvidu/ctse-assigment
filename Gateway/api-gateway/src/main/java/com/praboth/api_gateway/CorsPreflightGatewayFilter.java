package com.praboth.api_gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Answers browser CORS preflight (OPTIONS) at the gateway without proxying to downstream.
 * Downstream apps disable CORS; Azure/Spring combinations sometimes still return 403 on forwarded OPTIONS.
 */
@Component
public class CorsPreflightGatewayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (exchange.getRequest().getMethod() != HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }
        String origin = exchange.getRequest().getHeaders().getFirst(HttpHeaders.ORIGIN);
        if (origin == null || !isAllowedOrigin(origin)) {
            return chain.filter(exchange);
        }
        String reqMethod = exchange.getRequest().getHeaders().getFirst(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD);
        if (reqMethod == null) {
            return chain.filter(exchange);
        }

        exchange.getResponse().setStatusCode(HttpStatus.OK);
        var headers = exchange.getResponse().getHeaders();
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        headers.add(HttpHeaders.VARY, HttpHeaders.ORIGIN);
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
        headers.add(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");
        return exchange.getResponse().setComplete();
    }

    private static boolean isAllowedOrigin(String origin) {
        if (origin.startsWith("http://localhost:") || origin.equals("http://localhost")
                || origin.startsWith("http://127.0.0.1:") || origin.equals("http://127.0.0.1")) {
            return true;
        }
        if (!origin.startsWith("https://")) {
            return false;
        }
        try {
            var u = java.net.URI.create(origin);
            String host = u.getHost();
            if (host == null) {
                return false;
            }
            String h = host.toLowerCase();
            return h.endsWith(".vercel.app")
                    || h.endsWith(".netlify.app")
                    || h.endsWith(".azurecontainerapps.io");
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
