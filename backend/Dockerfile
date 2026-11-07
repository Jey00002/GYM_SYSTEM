# Etapa 1: Compilación
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copiar configuración de Maven Wrapper y dependencias
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Copiar el código fuente del proyecto
COPY src ./src

# Compilar y empaquetar la aplicación omitiendo tests
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar el binario JAR generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto por defecto
EXPOSE 8080

# Comando de arranque
ENTRYPOINT ["java", "-jar", "app.jar"]
