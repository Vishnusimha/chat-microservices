plugins {
	java
	id("org.springframework.boot") version "3.2.7"
	id("io.spring.dependency-management") version "1.1.5"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

extra["resilience4jVersion"] = "2.1.0" // Add the Spring Cloud version here
extra["springCloudVersion"] = "2023.0.2" // Add the Spring Cloud version here

dependencies {
	implementation("io.github.resilience4j:resilience4j-spring-boot2:${property("resilience4jVersion")}")
	implementation("io.github.resilience4j:resilience4j-circuitbreaker:${property("resilience4jVersion")}")
	implementation("io.github.resilience4j:resilience4j-core:${property("resilience4jVersion")}")
	implementation("org.springframework.boot:spring-boot-starter-aop")

	implementation ("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
	implementation ("org.springframework.boot:spring-boot-starter-webflux")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation ("mysql:mysql-connector-java:8.0.33")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	testImplementation("org.mockito:mockito-core")
}

dependencyManagement {
	imports {
		mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
	}
}
tasks.withType<Test> {
	useJUnitPlatform()
}
