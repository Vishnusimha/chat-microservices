import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiPlus, FiRefreshCw } from "react-icons/fi";

const API_BASE = "http://localhost:8765";

const Feed = () => {
  const { token, user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [feedResult, setFeedResult] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postResult, setPostResult] = useState("");
  const [postCategory, setPostCategory] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentResult, setCommentResult] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: "general", label: "General", color: "#667eea", emoji: "💬" },
    { value: "complaint", label: "Complaint", color: "#e53e3e", emoji: "⚠️" },
    { value: "suggestion", label: "Suggestion", color: "#48bb78", emoji: "💡" },
    { value: "announcement", label: "Announcement", color: "#ed8936", emoji: "📢" },
    { value: "question", label: "Question", color: "#38b2ac", emoji: "❓" },
    { value: "appreciation", label: "Appreciation", color: "#d69e2e", emoji: "👏" },
  ];

  // Auto-load feed when component mounts
  useEffect(() => {
    if (token) {
      handleFetchFeed();
    }
  }, [token]);

  // Clear results after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPostResult("");
      setCommentResult("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [postResult, commentResult]);

  const handleFetchFeed = useCallback(async () => {
    setIsLoading(true);
    setFeedResult("Loading feed...");
    try {
      const res = await fetch(`${API_BASE}/feed/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFeed(data);

        // Initialize like counts from backend data
        const initialLikeCounts = {};
        const initialLikedPosts = new Set();

        data.forEach((item) => {
          const postId = item.post?.id || item.id;
          const post = item.post || item;
          const likeCount = post.likes || post.likesCount || post.likeCount || 0;
          initialLikeCounts[postId] = likeCount;

          const likedBy = post.likedBy || post.likedByUsers || post.userLikes || [];
          let userHasLiked = false;
          if (Array.isArray(likedBy)) {
            userHasLiked = likedBy.some((like) => {
              if (typeof like === "string" || typeof like === "number") {
                return like.toString() === user?.userId?.toString();
              }
              if (typeof like === "object" && like.userId) {
                return like.userId.toString() === user?.userId?.toString();
              }
              return false;
            });
          }

          if (userHasLiked) {
            initialLikedPosts.add(postId);
          }
        });

        setLikeCounts(initialLikeCounts);
        setLikedPosts(initialLikedPosts);
        setFeedResult("");
      } else {
        setFeed([]);
        setFeedResult("Failed to load feed");
      }
    } catch (err) {
      setFeedResult("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.userId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPostResult("Posting...");

    if (!user || !user.userId) {
      setPostResult("User info missing. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/discussion/api/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: postContent, 
          userId: user.userId,
          category: postCategory,
          isAnonymous: isAnonymous
        }),
      });

      if (res.ok) {
        setPostResult("Post created successfully!");
        setPostContent("");
        setPostCategory("general");
        setIsAnonymous(false);
        handleFetchFeed();
      } else {
        const data = await res.json();
        setPostResult(data.message || data.error || "Failed to create post");
      }
    } catch (err) {
      setPostResult("Error: " + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentResult("Posting comment...");

    try {
      const res = await fetch(
        `${API_BASE}/discussion/api/posts/${commentingPostId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: commentContent,
            userId: user.userId,
          }),
        }
      );

      if (res.ok) {
        setCommentResult("Comment added!");
        setCommentContent("");
        setCommentingPostId(null);
        handleFetchFeed();
      } else {
        const data = await res.json();
        setCommentResult(data.message || data.error || "Failed to add comment");
      }
    } catch (err) {
      setCommentResult("Error: " + err.message);
    }
  };

  const handleLike = async (postId) => {
    const isCurrentlyLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);
    const newLikeCounts = { ...likeCounts };

    // Update UI optimistically
    if (isCurrentlyLiked) {
      newLikedPosts.delete(postId);
      newLikeCounts[postId] = Math.max(0, (newLikeCounts[postId] || 0) - 1);
    } else {
      newLikedPosts.add(postId);
      newLikeCounts[postId] = (newLikeCounts[postId] || 0) + 1;
    }

    setLikedPosts(newLikedPosts);
    setLikeCounts(newLikeCounts);

    // Send like/unlike to backend API (with fallback for unsupported backend)
    try {
      const possibleEndpoints = [
        `${API_BASE}/discussion/api/posts/${postId}/like`,
        `${API_BASE}/discussion/api/posts/${postId}/likes`,
      ];

      const method = isCurrentlyLiked ? "DELETE" : "POST";
      const payload = { userId: user.userId };

      for (const endpoint of possibleEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const responseData = await res.json();
            if (responseData && responseData.likes !== undefined) {
              setLikeCounts((prev) => ({ ...prev, [postId]: responseData.likes }));
            }
            break;
          }
        } catch (endpointError) {
          continue;
        }
      }
    } catch (err) {
      // Revert optimistic update on error
      if (isCurrentlyLiked) {
        newLikedPosts.add(postId);
        newLikeCounts[postId] = (newLikeCounts[postId] || 0) + 1;
      } else {
        newLikedPosts.delete(postId);
        newLikeCounts[postId] = Math.max(0, (newLikeCounts[postId] || 0) - 1);
      }
      setLikedPosts(newLikedPosts);
      setLikeCounts(newLikeCounts);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryData = (category) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const getStatusClass = (message) => {
    if (
      message.includes("successful") ||
      message.includes("added") ||
      message.includes("created")
    ) {
      return "status-success";
    } else if (message.includes("Error") || message.includes("failed")) {
      return "status-error";
    } else {
      return "status-loading";
    }
  };

  return (
    <div className="feed-page">
      {/* Create Post Section */}
      <div className="create-post-section">
        <div className="create-post-header">
          <FiPlus className="create-icon" />
          <h2>Share with Community</h2>
        </div>
        
        <form onSubmit={handleCreatePost} className="create-post-form">
          <div className="form-row">
            <div className="form-group category-select">
              <label>Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="category-dropdown"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group anonymous-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                Post Anonymously
              </label>
            </div>
          </div>

          <div className="form-group">
            <textarea
              className="post-textarea"
              placeholder="What's on your mind? Share your thoughts, suggestions, or feedback..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              rows={4}
            />
          </div>

          <button type="submit" className="create-post-btn" disabled={!postContent.trim()}>
            <FiPlus />
            Share Post
          </button>
        </form>

        {postResult && (
          <div className={`status-message ${getStatusClass(postResult)}`}>
            {postResult}
          </div>
        )}
      </div>

      {/* Feed Header */}
      <div className="feed-header">
        <h2 className="feed-title">Community Feed</h2>
        <div className="feed-actions">
          <button 
            className={`refresh-btn ${isLoading ? 'loading' : ''}`} 
            onClick={handleFetchFeed}
            disabled={isLoading}
          >
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {feedResult && (
        <div className={`status-message ${getStatusClass(feedResult)}`}>
          {feedResult}
        </div>
      )}

      {/* Feed Content */}
      {feed.length === 0 ? (
        <div className="empty-feed">
          <div className="empty-feed-icon">📝</div>
          <div className="empty-feed-text">
            No posts yet. Be the first to share something!
          </div>
        </div>
      ) : (
        <div className="feed-grid">
          {feed.map((item, i) => {
            const postId = item.post?.id || item.id;
            const isLiked = likedPosts.has(postId);
            const likeCount = likeCounts[postId] || 0;
            const post = item.post || item;
            const category = getCategoryData(post.category || 'general');

            return (
              <div key={i} className="post-card">
                <div className="post-header">
                  <div className="post-category" style={{ backgroundColor: category.color }}>
                    <span className="category-emoji">{category.emoji}</span>
                    <span className="category-label">{category.label}</span>
                  </div>
                  <button className="post-menu-btn">
                    <FiMoreHorizontal />
                  </button>
                </div>

                <div className="post-user-info">
                  <div className="post-avatar">
                    {getInitials(post.isAnonymous ? "Anonymous" : item.profileName)}
                  </div>
                  <div className="user-details">
                    <div className="post-username">
                      {post.isAnonymous ? "Anonymous User" : (item.profileName || "Anonymous")}
                    </div>
                    <div className="post-userid">
                      {post.isAnonymous ? "Hidden" : `User ID: ${item.userId}`}
                    </div>
                  </div>
                </div>

                <div className="post-content">
                  {post.content}
                </div>

                <div className="post-actions">
                  <button
                    className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(postId)}
                  >
                    <FiHeart className="action-icon" />
                    <span className="action-text">
                      {likeCount > 0 ? `${likeCount} Like${likeCount > 1 ? "s" : ""}` : "Like"}
                    </span>
                  </button>

                  <button
                    className="action-btn comment-btn"
                    onClick={() => {
                      setCommentingPostId(postId);
                      setCommentContent("");
                    }}
                  >
                    <FiMessageCircle className="action-icon" />
                    <span className="action-text">Comment</span>
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div className="comments-section">
                    <div className="comments-title">
                      <FiMessageCircle className="comments-icon" />
                      Comments ({post.comments.length})
                    </div>
                    {post.comments.map((comment, ci) => (
                      <div key={ci} className="comment-item">
                        <div className="comment-content">{comment.content}</div>
                        <div className="comment-author">by user {comment.userId}</div>
                      </div>
                    ))}
                  </div>
                )}

                {commentingPostId === postId && (
                  <form onSubmit={handleAddComment} className="comment-form">
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Write a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    />
                    <button type="submit" className="comment-submit-btn">
                      Post
                    </button>
                    <button
                      type="button"
                      className="comment-cancel-btn"
                      onClick={() => setCommentingPostId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      {commentResult && (
        <div className={`status-message ${getStatusClass(commentResult)}`}>
          {commentResult}
        </div>
      )}
    </div>
  );
};

export default Feed;