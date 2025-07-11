FROM amazoncorretto:17-alpine

# Set the working directory
WORKDIR /app

# Copy the Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy the source code
COPY src src

# Make gradlew executable
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew build -x test

# Copy the built jar file (use the main jar, not the plain jar)
RUN cp build/libs/*[!-plain].jar app.jar

# Expose the port
EXPOSE 8765

# Health check (install curl for health check)
RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8765/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
