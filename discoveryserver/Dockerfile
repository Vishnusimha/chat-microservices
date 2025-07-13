FROM openjdk:21-jdk
COPY build/libs/discoveryserver-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar", "app.jar"]