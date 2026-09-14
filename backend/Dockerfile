# 하다수피아 백엔드 — Spring Boot 3.3, Java 21
# 빌드: docker build -t <registry>/hada-api:<tag> backend/

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 의존성 해석을 소스 변경과 분리해 레이어 캐시를 살린다.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=builder /app/build/libs/*.jar app.jar

# 사진은 MinIO 에 올라가므로 컨테이너에 쓰기 볼륨이 필요 없다.
RUN chown -R spring:spring /app
USER spring:spring

EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
