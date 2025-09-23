package com.mislbd.spark.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    // Primary OpenAPI bean with Basic Auth scheme declared, so UI "Authorize" works when you later protect docs.
    @Bean
    public OpenAPI sparkOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SPARK API")
                        .version("v1")
                        .description("SPARK service endpoints")
                        .contact(new Contact().name("SPARK Team"))
                        .license(new License().name("Proprietary")))
                .addSecurityItem(new SecurityRequirement().addList("basicAuth"))
                .components(new Components().addSecuritySchemes("basicAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("basic")));
    }

    // Group only /api/** endpoints (if they exist) while still allowing wider scan if filters removed.
        // Temporarily disabled custom group to diagnose 500 on /v3/api-docs/api.
        // Uncomment after confirming base /v3/api-docs works and all controllers map under /api/**.
//    @Bean
//    public GroupedOpenApi apiGroup() {
//        return GroupedOpenApi.builder()
//                .group("api")
//                .pathsToMatch("/api/**")
//                .build();
//    }
}
