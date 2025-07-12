import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const successRate = new Rate('success_rate');
const responseTime = new Trend('response_time');
const errorCounter = new Counter('error_count');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 50 },    // Ramp down to 50 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    success_rate: ['rate>0.9'],       // Success rate should be above 90%
    error_count: ['count<100'],       // Error count should be below 100
  },
};

const BASE_URL = 'http://test-api-gateway:8765';

// Test data
const testUsers = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
];

let authToken = '';

export function setup() {
  // Register test users
  for (const user of testUsers) {
    const registerPayload = {
      userName: user.email.split('@')[0],
      email: user.email,
      password: user.password,
      profileName: `Test User ${user.email.split('@')[0]}`,
    };

    const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(registerPayload), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (registerResponse.status !== 201) {
      console.log(`Failed to register user: ${user.email}`);
    }
  }

  // Login to get auth token
  const loginPayload = {
    email: testUsers[0].email,
    password: testUsers[0].password,
  };

  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    authToken = loginData.token;
    return { authToken };
  }

  throw new Error('Failed to login during setup');
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.authToken}`,
  };

  // Test 1: Get all users
  const getUsersResponse = http.get(`${BASE_URL}/api/users/all`, { headers });
  check(getUsersResponse, {
    'get users status is 200': (r) => r.status === 200,
    'get users response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  successRate.add(getUsersResponse.status === 200);
  responseTime.add(getUsersResponse.timings.duration);
  
  if (getUsersResponse.status !== 200) {
    errorCounter.add(1);
  }

  // Test 2: Get aggregated feed
  const getFeedResponse = http.get(`${BASE_URL}/feed/all`, { headers });
  check(getFeedResponse, {
    'get feed status is 200': (r) => r.status === 200,
    'get feed response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  successRate.add(getFeedResponse.status === 200);
  responseTime.add(getFeedResponse.timings.duration);
  
  if (getFeedResponse.status !== 200) {
    errorCounter.add(1);
  }

  // Test 3: Create a post
  const createPostPayload = {
    content: `Test post from K6 - ${Date.now()}`,
    userId: 1,
  };

  const createPostResponse = http.post(
    `${BASE_URL}/discussion/api/posts/create`,
    JSON.stringify(createPostPayload),
    { headers }
  );
  
  check(createPostResponse, {
    'create post status is 201': (r) => r.status === 201,
    'create post response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  successRate.add(createPostResponse.status === 201);
  responseTime.add(createPostResponse.timings.duration);
  
  if (createPostResponse.status !== 201) {
    errorCounter.add(1);
  }

  // Test 4: Get all posts
  const getPostsResponse = http.get(`${BASE_URL}/discussion/api/posts/all`, { headers });
  check(getPostsResponse, {
    'get posts status is 200': (r) => r.status === 200,
    'get posts response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  successRate.add(getPostsResponse.status === 200);
  responseTime.add(getPostsResponse.timings.duration);
  
  if (getPostsResponse.status !== 200) {
    errorCounter.add(1);
  }

  // Wait between iterations
  sleep(1);
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Performance test completed');
}