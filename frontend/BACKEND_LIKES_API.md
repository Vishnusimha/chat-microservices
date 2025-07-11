# Backend Like API Implementation Guide

## Current Status
✅ **Frontend**: Fully implemented with fallback to local simulation mode
❌ **Backend**: Like endpoints not implemented yet

## Required Backend Endpoints

### 1. Add Like
**POST** `/discussion/api/posts/{postId}/like`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "likes": 5,
  "message": "Like added successfully"
}
```

### 2. Remove Like
**DELETE** `/discussion/api/posts/{postId}/like`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "likes": 4,
  "message": "Like removed successfully"
}
```

## Database Schema Suggestions

### Option 1: Separate Likes Table
```sql
CREATE TABLE post_likes (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Option 2: Add to Posts Table
```sql
ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN liked_by_users JSON; -- Array of user IDs
```

## Feed API Enhancement

Update your `/feed/all` endpoint to include like information:

```json
{
  "post": {
    "id": "post123",
    "content": "Hello world!",
    "likes": 5,
    "likedBy": ["user1", "user2", "user3"]
  },
  "userId": "user123",
  "profileName": "John Doe"
}
```

## Implementation Priority

1. **High Priority**: Add like endpoints to make likes persistent
2. **Medium Priority**: Update feed endpoint to include like counts
3. **Low Priority**: Add like history/analytics

## Testing

Once implemented, the frontend will automatically:
- ✅ Show green "Backend Ready" status
- ✅ Persist likes to database
- ✅ Show accurate like counts across sessions
- ✅ Handle like/unlike operations

## Current Frontend Behavior

- **With Backend**: Likes are saved permanently
- **Without Backend**: Likes work locally but reset on page refresh
- **Status Indicator**: Shows current mode in the feed header
