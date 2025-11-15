# Stage 1: Build with Alpine
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw .
COPY pom.xml .
# Add Maven settings for caching and accelerating dependencies
COPY settings.xml .
ENV MAVEN_USER_HOME=/app/.m2
RUN mkdir -p $MAVEN_USER_HOME
RUN --mount=type=cache,target=/app/.m2 ./mvnw -s settings.xml dependency:go-offline -B
COPY src ./src
RUN --mount=type=cache,target=/app/.m2 ./mvnw -s settings.xml package -DskipTests -B


# Stage 2: Runtime with Distroless (minimal and secure)
FROM gcr.io/distroless/java21-debian12
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE ${BACKEND_PORT}
ENTRYPOINT ["java", "-jar", "app.jar"]
