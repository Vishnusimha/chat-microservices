# chat-microservices

Understand the relationships and communication between these microservices by examining their code, configuration, and API endpoints. Here’s a summary based on your workspace:
 http://localhost:8761/

## Microservices Overview

- **users**: Manages user data (e.g., user profiles, user IDs).
- **feed**: Aggregates posts and user data to provide a feed (uses data from both users and discussion).
- **discussion**: Manages posts and comments.
- **api-gateway**: Likely acts as a single entry point for client requests, routing them to the appropriate service.
- **discoveryserver**: Likely used for service discovery (e.g., Eureka), allowing services to find each other dynamically.

## How They Communicate

- **REST API Calls**: Services communicate via HTTP REST endpoints.
- **Service Discovery**: Likely via the discoveryserver, so services can find each other by name.
- **Example Communication**:
    - `FeedServiceImpl` in the feed service calls:
        - `http://usersservice/users/all` to get all users from the users service.
        - `http://discussion/api/posts/all` to get all posts from the discussion service.
        - `http://usersservice/users/{userName}` to get a specific user.
        - `http://discussion/api/posts/userId/{userId}` to get posts by a specific user.

## What Each Service Does

- **users**: Provides user information (e.g., `/users/all`, `/users/{userName}`).
- **discussion**: Handles posts and comments (e.g., `/api/posts/all`, `/api/posts/userId/{userId}`).
- **feed**: Aggregates data from users and discussion to build a user feed (e.g., combines user profile info with posts).
- **api-gateway**: Routes external requests to the correct service.
- **discoveryserver**: Enables dynamic service registration and lookup.

## How to Visualize or Understand Connections

- **Read Controller and Service Classes**: Look at REST endpoints in controller classes (e.g., `PostController`).
- **Check WebClient/RestTemplate Usage**: See where services make HTTP calls to other services (e.g., `FeedServiceImpl`).
- **Review API Gateway Config**: See how routes are mapped (check api-gateway configs).
- **Service Discovery**: Check if services register with the discoveryserver (look for `@EnableEurekaClient` or similar annotations).

## Summary Diagram

```plaintext
[Client] --> [API Gateway] --> [feed] --> [users]
                                 |         ^
                                 v         |
                             [discussion]--+
```

- The **feed** service aggregates data from **users** and **discussion**.
- **API Gateway** is the entry point for clients.
- **discoveryserver** helps all services find each other.
---
# DOCUMENTATION FOR API GATEWAY AND SERVICES

## **1. API Gateway (Entry Point for All Requests)**

**Base URL:**
```
http://localhost:8765/
```

---

### **Authentication APIs**

| Endpoint                                      | Method | Description                       | Example Body / Usage                |
|------------------------------------------------|--------|-----------------------------------|-------------------------------------|
| `/api/v1/auth/authenticate`                    | POST   | Get JWT token                     | `{ "email": "yournewemail@example.com", "password": "yournewpassword" }` |
| `/api/v1/auth/authenticatetest`                | GET    | Test authentication endpoint      | No body                             |
| `/test`                                        | GET    | Test API Gateway is working       | No body                             |

**How to use:**
- POST to `/api/v1/auth/authenticate` with your credentials to get a JWT token.
- Use the JWT as a **Bearer Token** in the Authorization header for protected endpoints.

---

### **Feed Service APIs (via Gateway)**

| Endpoint                        | Method | Description                         | Example URL                                      |
|----------------------------------|--------|-------------------------------------|--------------------------------------------------|
| `/feed/all`                     | GET    | Get all feed items                  | `http://localhost:8765/feed/all`                 |
| `/feed/user/{userName}`         | GET    | Get feed for a specific user        | `http://localhost:8765/feed/user/vishnu`         |
| `/feed/hello`                   | GET    | Test endpoint for feed service      | `http://localhost:8765/feed/hello`               |

---

### **Users Service APIs (via Gateway)**

| Endpoint                        | Method | Description                         | Example URL                                      |
|----------------------------------|--------|-------------------------------------|--------------------------------------------------|
| `/users/all`                    | GET    | Get all users                       | `http://localhost:8765/users/all`                |
| `/users/user/{userId}`          | GET    | Get user by user ID                 | `http://localhost:8765/users/user/1`             |
| `/users/{userName}`             | GET    | Get user by user name               | `http://localhost:8765/users/vishnu`             |
| `/users/greeting`               | GET    | Get greeting with DB values         | `http://localhost:8765/users/greeting`           |
| `/users/sampleList`             | GET    | Get sample list from config         | `http://localhost:8765/users/sampleList`         |

---

### **Discussion Service APIs (via Gateway)**

| Endpoint                                  | Method | Description                         | Example URL                                      |
|--------------------------------------------|--------|-------------------------------------|--------------------------------------------------|
| `/api/posts/create`                        | POST   | Create a new post                   | `http://localhost:8765/api/posts/create`         |
| `/api/posts/{postId}/update`               | PUT    | Update a post                       | `http://localhost:8765/api/posts/1/update`       |
| `/api/posts/{postId}`                      | GET    | Get post by ID                      | `http://localhost:8765/api/posts/1`              |
| `/api/posts/userId/{userId}`               | GET    | Get posts by user ID                | `http://localhost:8765/api/posts/userId/1`       |
| `/api/posts/all`                           | GET    | Get all posts with comments         | `http://localhost:8765/api/posts/all`            |
| `/api/posts/{postId}`                      | DELETE | Delete post by ID                   | `http://localhost:8765/api/posts/1`              |
| `/api/posts/{postId}/comment`              | POST   | Add comment to post                 | `http://localhost:8765/api/posts/1/comment`      |
| `/api/posts/{postId}/comment/{commentId}`  | DELETE | Delete comment from post            | `http://localhost:8765/api/posts/1/comment/2`    |
| `/hello`                                   | GET    | Sample hello endpoint               | `http://localhost:8765/hello?name=World`         |

---

## **How They Relate**

- **API Gateway** is the single entry point for all requests.
- **Feed Service** aggregates data from **Users** and **Discussion** services.
- **Users Service** provides user info.
- **Discussion Service** manages posts and comments.
- **JWT Authentication** is handled at the gateway; you must authenticate and use the token for protected endpoints.

**Diagram:**

```plaintext
[Client/Postman]
      |
      v
[API Gateway]
   |     |     |
   v     v     v
[Feed] [Users] [Discussion]
   ^     |      ^
   |     v      |
   +-----+------+
```

---

## **Testing in Postman**

### **Step 1: Authenticate and Get JWT**
- **POST** `http://localhost:8765/api/v1/auth/authenticate`
- Body (JSON):
  ```json
  {
    "email": "yournewemail@example.com",
    "password": "yournewpassword"
  }
  ```
- Copy the token from the response.

### **Step 2: Use JWT for Other Requests**
- For all other endpoints, set:
    - **Authorization**: Bearer `<your-token-here>`

---

## **Individual Example Links**

- **Get all users:**  
  `GET http://localhost:8765/users/all`
- **Get feed:**  
  `GET http://localhost:8765/feed/all`
- **Get posts by user ID:**  
  `GET http://localhost:8765/api/posts/userId/1`
- **Create a post:**  
  `POST http://localhost:8765/api/posts/create`  
  (Body: JSON for your post)
- **Add comment to post:**  
  `POST http://localhost:8765/api/posts/1/comment`  
  (Body: JSON for your comment)

---

## **Tips**
- Always authenticate first and use the JWT for protected endpoints.
- If you get a 401 error, check your token and Authorization header.
- Use the `/test` endpoints to verify each service is up.

---

Let me know if you want sample request bodies for posts or comments, or if you want to secure/unsecure any endpoints!

---
Vishnusimha: is there a way to undertand the realtion betwenne these micorservices and how they are connected to each other and communication is happening ?

and what its dooing ?

Workspace: Collecting workspace informationYes, you can understand the relationships and communication between these microservices by examining their code, configuration, and API endpoints. Here’s a summary based on your workspace:

## Microservices Overview

- **users**: Manages user data (e.g., user profiles, user IDs).
- **feed**: Aggregates posts and user data to provide a feed (uses data from both users and discussion).
- **discussion**: Manages posts and comments.
- **api-gateway**: Likely acts as a single entry point for client requests, routing them to the appropriate service.
- **discoveryserver**: Likely used for service discovery (e.g., Eureka), allowing services to find each other dynamically.

## How They Communicate

- **REST API Calls**: Services communicate via HTTP REST endpoints.
- **Service Discovery**: Likely via the discoveryserver, so services can find each other by name.
- **Example Communication**:
    - `FeedServiceImpl` in the feed service calls:
        - `http://usersservice/users/all` to get all users from the users service.
        - `http://discussion/api/posts/all` to get all posts from the discussion service.
        - `http://usersservice/users/{userName}` to get a specific user.
        - `http://discussion/api/posts/userId/{userId}` to get posts by a specific user.

## What Each Service Does

- **users**: Provides user information (e.g., `/users/all`, `/users/{userName}`).
- **discussion**: Handles posts and comments (e.g., `/api/posts/all`, `/api/posts/userId/{userId}`).
- **feed**: Aggregates data from users and discussion to build a user feed (e.g., combines user profile info with posts).
- **api-gateway**: Routes external requests to the correct service.
- **discoveryserver**: Enables dynamic service registration and lookup.

## How to Visualize or Understand Connections

- **Read Controller and Service Classes**: Look at REST endpoints in controller classes (e.g., `PostController`).
- **Check WebClient/RestTemplate Usage**: See where services make HTTP calls to other services (e.g., `FeedServiceImpl`).
- **Review API Gateway Config**: See how routes are mapped (check api-gateway configs).
- **Service Discovery**: Check if services register with the discoveryserver (look for `@EnableEurekaClient` or similar annotations).

## Summary Diagram

```plaintext
[Client] --> [API Gateway] --> [feed] --> [users]
                                 |         ^
                                 v         |
                             [discussion]--+
```

- The **feed** service aggregates data from **users** and **discussion**.
- **API Gateway** is the entry point for clients.
- **discoveryserver** helps all services find each other.

---

For more details, check the controller and service classes in each service, especially where they use `WebClient` or similar HTTP clients to call other services.

Vishnusimha: in summary diagram what is client in my project ?

GitHub Copilot: In your project, the **client** refers to any external application or user interface that interacts with your microservices through the API Gateway. This could be:

- A web frontend (e.g., React, Angular, or plain HTML/JS app)
- A mobile app
- Postman or curl (for testing APIs)
- Any other service or consumer making HTTP requests to your system

The client sends requests to the API Gateway (`apigateway`), which then routes those requests to the appropriate backend microservice.

Vishnusimha: give example links how clients send requests to api gateway ?

GitHub Copilot: Here are example links (URLs) that a client might use to send requests to your API Gateway, based on your configuration:

- **Base URL:**
  ```
  http://localhost:8765/
  ```

### Example Requests

1. **Get all users (routed to users service):**
   ```
   http://localhost:8765/users/all
   ```

2. **Get user by username:**
   ```
   http://localhost:8765/users/{userName}
   ```

3. **Get all posts (routed to discussion service):**
   ```
   http://localhost:8765/api/posts/all
   ```

4. **Get posts by user ID:**
   ```
   http://localhost:8765/api/posts/userId/{userId}
   ```

5. **Get feed (routed to feed service):**
   ```
   http://localhost:8765/feed
   ```
