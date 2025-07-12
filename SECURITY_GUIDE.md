# Chat Microservices Security Guide

## Overview

This document outlines the comprehensive security measures implemented in the Chat Microservices application, including authentication, authorization, data protection, and security best practices.

## Security Architecture

### 1. Authentication & Authorization

#### JWT Token-Based Authentication
```java
@Component
public class JwtAuthenticationProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private int jwtExpiration;
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities());
        claims.put("userId", ((UserPrincipal) userDetails).getId());
        
        return createToken(claims, userDetails.getUsername());
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
}
```

#### OAuth2 Integration
```yaml
# OAuth2 configuration
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope:
              - user:email
              - read:user
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v2/userinfo
            user-name-attribute: email
```

### 2. API Gateway Security

#### Rate Limiting
```java
@Component
public class RateLimitingFilter implements GatewayFilter {
    
    @Autowired
    private RedisCacheService redisService;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientId = getClientId(exchange.getRequest());
        String rateLimitKey = "rate_limit:" + clientId;
        
        return Mono.fromCallable(() -> {
            boolean isRateLimited = redisService.isRateLimited(rateLimitKey, 100, 60); // 100 requests per minute
            
            if (isRateLimited) {
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                response.getHeaders().add("X-RateLimit-Limit", "100");
                response.getHeaders().add("X-RateLimit-Remaining", "0");
                response.getHeaders().add("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + 60000));
                
                DataBuffer buffer = response.bufferFactory().wrap("Rate limit exceeded".getBytes());
                return response.writeWith(Mono.just(buffer));
            }
            
            return chain.filter(exchange);
        }).flatMap(result -> (Mono<Void>) result);
    }
}
```

#### CORS Configuration
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "https://*.chat-microservices.com",
            "https://chat-microservices.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3. Data Protection

#### Database Security
```java
@Configuration
public class DatabaseSecurityConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(environment.getProperty("spring.datasource.url"));
        config.setUsername(environment.getProperty("spring.datasource.username"));
        config.setPassword(environment.getProperty("spring.datasource.password"));
        
        // Security configurations
        config.addDataSourceProperty("useSSL", "true");
        config.addDataSourceProperty("requireSSL", "true");
        config.addDataSourceProperty("verifyServerCertificate", "true");
        config.addDataSourceProperty("allowPublicKeyRetrieval", "false");
        
        // Connection pool security
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setLeakDetectionThreshold(60000);
        
        return new HikariDataSource(config);
    }
}
```

#### Encryption at Rest
```java
@Component
public class FieldEncryption {
    
    @Value("${encryption.key}")
    private String encryptionKey;
    
    public String encrypt(String plainText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encrypted = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }
    
    public String decrypt(String encryptedText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }
}
```

### 4. Input Validation & Sanitization

#### Request Validation
```java
@RestController
@Validated
public class UserController {
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Sanitize input
        String sanitizedEmail = sanitizeEmail(request.getEmail());
        String sanitizedUsername = sanitizeUsername(request.getUsername());
        
        // Additional validation
        if (!isValidEmail(sanitizedEmail)) {
            throw new ValidationException("Invalid email format");
        }
        
        if (!isValidUsername(sanitizedUsername)) {
            throw new ValidationException("Invalid username format");
        }
        
        // Create user
        User user = userService.createUser(sanitizedUsername, sanitizedEmail, request.getPassword());
        return ResponseEntity.ok(user);
    }
    
    private String sanitizeEmail(String email) {
        return email.trim().toLowerCase().replaceAll("[^a-zA-Z0-9@._-]", "");
    }
    
    private String sanitizeUsername(String username) {
        return username.trim().toLowerCase().replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
```

#### SQL Injection Prevention
```java
@Repository
public class UserRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<User> findUsersByName(String name) {
        // Use parameterized queries to prevent SQL injection
        String sql = "SELECT * FROM users WHERE LOWER(username) LIKE LOWER(?)";
        return jdbcTemplate.query(sql, new Object[]{"%" + name + "%"}, new UserRowMapper());
    }
    
    public User findUserByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{email}, new UserRowMapper());
    }
}
```

### 5. Security Headers

#### HTTP Security Headers
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
                .and()
                .addHeaderWriter(new StaticHeadersWriter("X-Content-Type-Options", "nosniff"))
                .addHeaderWriter(new StaticHeadersWriter("X-Frame-Options", "DENY"))
                .addHeaderWriter(new StaticHeadersWriter("X-XSS-Protection", "1; mode=block"))
                .addHeaderWriter(new StaticHeadersWriter("Referrer-Policy", "strict-origin-when-cross-origin"))
                .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy", "geolocation=(), microphone=(), camera=()"))
            )
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

### 6. Audit Logging

#### Security Event Logging
```java
@Component
public class SecurityAuditLogger {
    
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");
    
    @EventListener
    public void handleAuthenticationSuccess(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();
        String ipAddress = getClientIpAddress();
        
        auditLogger.info("AUTHENTICATION_SUCCESS: user={}, ip={}, timestamp={}", 
            username, ipAddress, Instant.now());
    }
    
    @EventListener
    public void handleAuthenticationFailure(AbstractAuthenticationFailureEvent event) {
        String username = event.getAuthentication().getName();
        String ipAddress = getClientIpAddress();
        String reason = event.getException().getMessage();
        
        auditLogger.warn("AUTHENTICATION_FAILURE: user={}, ip={}, reason={}, timestamp={}", 
            username, ipAddress, reason, Instant.now());
    }
    
    @EventListener
    public void handleAccessDenied(AccessDeniedEvent event) {
        String username = event.getAuthentication().getName();
        String resource = event.getConfigAttribute().toString();
        
        auditLogger.warn("ACCESS_DENIED: user={}, resource={}, timestamp={}", 
            username, resource, Instant.now());
    }
}
```

### 7. Secrets Management

#### AWS Secrets Manager Integration
```java
@Configuration
public class SecretsManagerConfig {
    
    @Bean
    public AWSSecretsManager secretsManager() {
        return AWSSecretsManagerClientBuilder.standard()
            .withRegion(Regions.US_WEST_2)
            .build();
    }
    
    @Bean
    public SecretsManagerConfigurationProvider secretsProvider() {
        return SecretsManagerConfigurationProvider.builder()
            .withSecretsManager(secretsManager())
            .withSecretName("chat-microservices/config")
            .build();
    }
}
```

#### Environment Variable Security
```bash
# Use environment variables for sensitive data
export JWT_SECRET="your-super-secure-jwt-secret-key-here"
export DB_PASSWORD="your-database-password"
export ENCRYPTION_KEY="your-32-character-encryption-key"
export OAUTH2_CLIENT_SECRET="your-oauth2-client-secret"

# Use Docker secrets in production
docker secret create jwt_secret jwt_secret.txt
docker secret create db_password db_password.txt
```

### 8. Network Security

#### SSL/TLS Configuration
```yaml
# HTTPS configuration
server:
  port: 8443
  ssl:
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: chat-microservices
    enabled: true
    protocol: TLS
    enabled-protocols: TLSv1.2,TLSv1.3
    ciphers: TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256
```

#### Service Mesh Security (Istio)
```yaml
# Istio security policy
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: chat-microservices-mtls
  namespace: chat-microservices
spec:
  mtls:
    mode: STRICT
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: chat-microservices-authz
  namespace: chat-microservices
spec:
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/chat-microservices/sa/api-gateway"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
```

### 9. Security Testing

#### Automated Security Tests
```java
@SpringBootTest
@AutoConfigureTestDatabase
class SecurityIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testUnauthorizedAccess() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/users", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
    
    @Test
    void testSqlInjectionPrevention() {
        String maliciousInput = "'; DROP TABLE users; --";
        ResponseEntity<String> response = restTemplate.getForEntity("/api/users/search?name=" + maliciousInput, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    
    @Test
    void testXssProtection() {
        String xssPayload = "<script>alert('xss')</script>";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(xssPayload);
        
        ResponseEntity<String> response = restTemplate.postForEntity("/api/users", request, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
```

### 10. Security Monitoring

#### Security Metrics
```java
@Component
public class SecurityMetricsCollector {
    
    private final Counter authFailureCounter = Counter.build()
        .name("authentication_failures_total")
        .labelNames("type", "ip")
        .help("Total authentication failures")
        .register();
    
    private final Counter accessDeniedCounter = Counter.build()
        .name("access_denied_total")
        .labelNames("resource", "user")
        .help("Total access denied events")
        .register();
    
    @EventListener
    public void recordAuthenticationFailure(AuthenticationFailureEvent event) {
        authFailureCounter.labels(event.getType(), event.getIpAddress()).inc();
    }
    
    @EventListener
    public void recordAccessDenied(AccessDeniedEvent event) {
        accessDeniedCounter.labels(event.getResource(), event.getUser()).inc();
    }
}
```

## Security Checklist

### Development
- [ ] Use HTTPS for all communications
- [ ] Implement proper authentication and authorization
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Enable audit logging
- [ ] Use secrets management
- [ ] Implement proper session management
- [ ] Add CORS configuration

### Deployment
- [ ] Use secure Docker images
- [ ] Configure network security
- [ ] Set up monitoring and alerting
- [ ] Enable database encryption
- [ ] Configure SSL/TLS
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Configure VPC security groups
- [ ] Set up key rotation
- [ ] Enable backup encryption

### Operations
- [ ] Regular security assessments
- [ ] Dependency vulnerability scanning
- [ ] Security patch management
- [ ] Incident response plan
- [ ] Security training
- [ ] Regular security audits
- [ ] Compliance monitoring
- [ ] Threat intelligence
- [ ] Security documentation
- [ ] Recovery procedures

## Compliance Considerations

### GDPR Compliance
```java
@Service
public class DataPrivacyService {
    
    public void deleteUserData(String userId) {
        // Delete user data across all services
        userService.deleteUser(userId);
        postService.deletePostsByUser(userId);
        commentService.deleteCommentsByUser(userId);
        
        // Log the deletion for audit
        auditLogger.info("USER_DATA_DELETED: userId={}, timestamp={}", userId, Instant.now());
    }
    
    public UserDataExport exportUserData(String userId) {
        // Export all user data for GDPR compliance
        return UserDataExport.builder()
            .user(userService.getUser(userId))
            .posts(postService.getPostsByUser(userId))
            .comments(commentService.getCommentsByUser(userId))
            .build();
    }
}
```

### HIPAA Compliance
```java
@Configuration
public class HipaaSecurityConfig {
    
    @Bean
    public DataSource encryptedDataSource() {
        // Configure encrypted database connections
        HikariConfig config = new HikariConfig();
        config.addDataSourceProperty("useSSL", "true");
        config.addDataSourceProperty("requireSSL", "true");
        config.addDataSourceProperty("serverTimezone", "UTC");
        config.addDataSourceProperty("characterEncoding", "UTF-8");
        config.addDataSourceProperty("useUnicode", "true");
        
        return new HikariDataSource(config);
    }
}
```

This comprehensive security implementation provides enterprise-grade protection for the Chat Microservices application, covering all major security concerns including authentication, authorization, data protection, and compliance requirements.