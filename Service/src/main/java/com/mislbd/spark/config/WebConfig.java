package com.mislbd.spark.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // Use patterns so non-localhost origins on your LAN are allowed (e.g., http://192.168.1.141:4200)
                        .allowedOriginPatterns("http://localhost:4200", "http://127.0.0.1:4200", "http://192.168.*.*:*", "http://*.local:*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}