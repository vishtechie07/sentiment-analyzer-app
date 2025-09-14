package com.sentiment.analyzer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting configuration to prevent API abuse.
 * 
 * Implements a simple in-memory rate limiter for the sentiment analysis endpoint.
 * 
 * @author Vishnu
 */
@Configuration
public class RateLimitConfig implements WebMvcConfigurer {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_REQUESTS_PER_HOUR = 1000;
    
    private final ConcurrentHashMap<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor())
               .addPathPatterns("/api/analyze");
    }

    @Bean
    public HandlerInterceptor rateLimitInterceptor() {
        return new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                String clientIp = getClientIpAddress(request);
                
                if (isRateLimitExceeded(clientIp)) {
                    response.setStatus(429); // Too Many Requests
                    response.getWriter().write("Rate limit exceeded. Please try again later.");
                    return false;
                }
                
                return true;
            }
        };
    }

    /**
     * Gets the client IP address from the request.
     * 
     * @param request the HTTP request
     * @return the client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Checks if the rate limit is exceeded for the given client IP.
     * 
     * @param clientIp the client IP address
     * @return true if rate limit is exceeded
     */
    private boolean isRateLimitExceeded(String clientIp) {
        RequestCounter counter = requestCounters.computeIfAbsent(clientIp, k -> new RequestCounter());
        
        long currentTime = System.currentTimeMillis();
        
        // Clean up old entries
        counter.cleanup(currentTime);
        
        // Check minute limit
        if (counter.getMinuteCount() >= MAX_REQUESTS_PER_MINUTE) {
            return true;
        }
        
        // Check hour limit
        if (counter.getHourCount() >= MAX_REQUESTS_PER_HOUR) {
            return true;
        }
        
        // Increment counters
        counter.increment(currentTime);
        
        return false;
    }

    /**
     * Request counter for tracking rate limits.
     */
    private static class RequestCounter {
        private final AtomicInteger minuteCount = new AtomicInteger(0);
        private final AtomicInteger hourCount = new AtomicInteger(0);
        private long lastMinuteReset = System.currentTimeMillis();
        private long lastHourReset = System.currentTimeMillis();

        public void increment(long currentTime) {
            minuteCount.incrementAndGet();
            hourCount.incrementAndGet();
        }

        public int getMinuteCount() {
            return minuteCount.get();
        }

        public int getHourCount() {
            return hourCount.get();
        }

        public void cleanup(long currentTime) {
            // Reset minute counter every minute
            if (currentTime - lastMinuteReset >= 60000) {
                minuteCount.set(0);
                lastMinuteReset = currentTime;
            }
            
            // Reset hour counter every hour
            if (currentTime - lastHourReset >= 3600000) {
                hourCount.set(0);
                lastHourReset = currentTime;
            }
        }
    }
}
