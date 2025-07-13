FROM openjdk:21-jdk
COPY build/libs/discussion-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar", "app.jar"]