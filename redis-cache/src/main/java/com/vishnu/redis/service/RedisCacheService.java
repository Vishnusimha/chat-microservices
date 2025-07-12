package com.vishnu.redis.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    // Basic cache operations
    @Cacheable(value = "user-cache", key = "#userId")
    public Object getUserFromCache(String userId) {
        log.info("Getting user from cache: {}", userId);
        return redisTemplate.opsForValue().get("user:" + userId);
    }

    @CachePut(value = "user-cache", key = "#userId")
    public Object putUserInCache(String userId, Object user) {
        log.info("Putting user in cache: {}", userId);
        redisTemplate.opsForValue().set("user:" + userId, user, 1, TimeUnit.HOURS);
        return user;
    }

    @CacheEvict(value = "user-cache", key = "#userId")
    public void evictUserFromCache(String userId) {
        log.info("Evicting user from cache: {}", userId);
        redisTemplate.delete("user:" + userId);
    }

    // Session management
    public void storeSession(String sessionId, Object sessionData) {
        redisTemplate.opsForValue().set("session:" + sessionId, sessionData, 24, TimeUnit.HOURS);
    }

    public Object getSession(String sessionId) {
        return redisTemplate.opsForValue().get("session:" + sessionId);
    }

    public void invalidateSession(String sessionId) {
        redisTemplate.delete("session:" + sessionId);
    }

    // JWT token blacklist
    public void blacklistToken(String token) {
        redisTemplate.opsForValue().set("blacklist:" + token, "blacklisted", 24, TimeUnit.HOURS);
    }

    public boolean isTokenBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }

    // Rate limiting
    public boolean isRateLimited(String key, int limit, long windowSeconds) {
        String rateLimitKey = "rate_limit:" + key;
        String currentValue = (String) redisTemplate.opsForValue().get(rateLimitKey);
        
        if (currentValue == null) {
            redisTemplate.opsForValue().set(rateLimitKey, "1", windowSeconds, TimeUnit.SECONDS);
            return false;
        }
        
        int count = Integer.parseInt(currentValue);
        if (count >= limit) {
            return true;
        }
        
        redisTemplate.opsForValue().increment(rateLimitKey);
        return false;
    }

    // Distributed locks
    public boolean acquireLock(String lockKey, String value, long expireTime) {
        Boolean result = redisTemplate.opsForValue().setIfAbsent(lockKey, value, expireTime, TimeUnit.SECONDS);
        return result != null && result;
    }

    public void releaseLock(String lockKey, String value) {
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        redisTemplate.execute(
            connection -> connection.eval(script.getBytes(), org.springframework.data.redis.connection.ReturnType.INTEGER, 1, lockKey.getBytes(), value.getBytes()),
            false
        );
    }

    // Pub/Sub messaging
    public void publishMessage(String channel, Object message) {
        redisTemplate.convertAndSend(channel, message);
    }

    // Cache statistics
    public long getCacheSize(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? keys.size() : 0;
    }

    public void clearCache(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}