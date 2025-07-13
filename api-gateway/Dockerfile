FROM openjdk:21-jdk
COPY build/libs/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8765
ENTRYPOINT ["java","-jar", "app.jar"]