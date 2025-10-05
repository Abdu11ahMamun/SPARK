# Multi-stage build for Spring Boot (Gradle)
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# Copy build metadata first (better layer caching)
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle

# Pre-download dependencies (will cache unless build files change)
RUN ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# Copy source
COPY src ./src

# Build fat jar
RUN ./gradlew --no-daemon clean bootJar

# Runtime image (slim JRE)
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
# Install curl for healthcheck
RUN apk add --no-cache curl
# (Optional) Add a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Copy built jar
COPY --from=build /workspace/build/libs/*SNAPSHOT.jar app.jar

# Expose port (matches server.port / default 8080)
EXPOSE 8080

# Healthcheck uses Actuator (ensure management endpoints enabled)
#HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:8080/actuator/health || exit 1

# Allow passing JVM opts (memory tuning, etc.)
ENV JAVA_OPTS=""

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
