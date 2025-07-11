import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8765"; // API Gateway base URL

function App() {
  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    profileName: "",
  });

  // UI state
  const [authResult, setAuthResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Feed state
  const [feed, setFeed] = useState([]);
  const [feedResult, setFeedResult] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postResult, setPostResult] = useState("");

  // Comment state
  const [commentContent, setCommentContent] = useState("");
  const [commentResult, setCommentResult] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);

  // Liked posts state with counts
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [backendSupportsLikes, setBackendSupportsLikes] = useState(false);

  // Load saved auth data on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("chatSphereToken");
    const savedUser = localStorage.getItem("chatSphereUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  // Save auth data to localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("chatSphereToken", token);
      localStorage.setItem("chatSphereUser", JSON.stringify(user));
    }
  }, [token, user]);

  // Auto-load feed when token changes
  useEffect(() => {
    if (token) {
      handleFetchFeed();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear results after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthResult("");
      setPostResult("");
      setCommentResult("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [authResult, postResult, commentResult]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthResult("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin && data.token) {
          setToken(data.token);
          // Combine API response with form data (email from login form)
          const userData = {
            ...data,
            email: formData.email, // Add email from form since API doesn't return it
          };
          setUser(userData);
          setAuthResult("Login successful!");
          setFormData({
            userName: "",
            email: "",
            password: "",
            profileName: "",
          });
        } else if (!isLogin) {
          setAuthResult("Registration successful! Please login.");
          setIsLogin(true);
          setFormData({
            userName: "",
            email: "",
            password: "",
            profileName: "",
          });
        }
      } else {
        setAuthResult(
          data.message ||
            data.error ||
            `${isLogin ? "Login" : "Registration"} failed`
        );
      }
    } catch (err) {
      setAuthResult("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFeed = async () => {
    setFeedResult("Loading feed...");
    try {
      const res = await fetch(`${API_BASE}/feed/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Backend feed data:", data);
        setFeed(data);

        // Initialize like counts from backend data
        const initialLikeCounts = {};
        const initialLikedPosts = new Set();

        data.forEach((item, index) => {
          const postId = item.post?.id || item.id;
          const post = item.post || item;

          console.log(`Post ${index}:`, {
            postId,
            post,
            item,
            likes: post.likes,
            likedBy: post.likedBy,
            likesCount: post.likesCount,
            likeCount: post.likeCount,
          });

          // Try multiple possible field names for like count
          const likeCount =
            post.likes || post.likesCount || post.likeCount || 0;
          initialLikeCounts[postId] = likeCount;

          // Check if current user has liked this post - try multiple field names
          const likedBy =
            post.likedBy || post.likedByUsers || post.userLikes || [];

          // Handle different formats: array of user IDs, array of objects, etc.
          let userHasLiked = false;
          if (Array.isArray(likedBy)) {
            userHasLiked = likedBy.some((like) => {
              // If it's a simple array of user IDs
              if (typeof like === "string" || typeof like === "number") {
                return like.toString() === user?.userId?.toString();
              }
              // If it's an array of objects with userId property
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

        console.log("Initial like counts:", initialLikeCounts);
        console.log("Initial liked posts:", initialLikedPosts);

        setLikeCounts(initialLikeCounts);
        setLikedPosts(initialLikedPosts);
        setFeedResult("");
      } else {
        setFeed([]);
        setFeedResult("Failed to load feed");
      }
    } catch (err) {
      setFeedResult("Error: " + err.message);
    }
  };

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
        body: JSON.stringify({ content: postContent, userId: user.userId }),
      });

      if (res.ok) {
        setPostResult("Post created successfully!");
        setPostContent("");
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

    if (!user || !user.userId) {
      setCommentResult("User info missing. Please login again.");
      return;
    }

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
    console.log("handleLike called with postId:", postId);
    console.log("Current user:", user);

    const isCurrentlyLiked = likedPosts.has(postId);
    console.log("Is currently liked:", isCurrentlyLiked);

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

    console.log("Updated like counts:", newLikeCounts);
    console.log("Updated liked posts:", newLikedPosts);

    setLikedPosts(newLikedPosts);
    setLikeCounts(newLikeCounts);

    // Send like/unlike to backend API
    try {
      // Try multiple possible endpoint patterns
      const possibleEndpoints = [
        `${API_BASE}/discussion/api/posts/${postId}/like`,
        `${API_BASE}/discussion/api/posts/${postId}/likes`,
        `${API_BASE}/api/posts/${postId}/like`,
        `${API_BASE}/posts/${postId}/like`,
      ];

      const method = isCurrentlyLiked ? "DELETE" : "POST";
      const payload = { userId: user.userId };

      console.log("Making API call:", { method, payload });

      let apiSuccess = false;
      let responseData = null;

      // Try each endpoint until one works
      for (const endpoint of possibleEndpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          const res = await fetch(endpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          console.log("API response status:", res.status);

          if (res.ok) {
            responseData = await res.json();
            console.log("API response data:", responseData);
            apiSuccess = true;
            setBackendSupportsLikes(true); // Mark backend as supporting likes
            break;
          } else if (res.status === 404) {
            console.log("Endpoint not found, trying next...");
            continue;
          } else {
            responseData = await res.json();
            console.error("API call failed:", responseData);
            break;
          }
        } catch (endpointError) {
          console.log("Endpoint error:", endpointError.message);
          continue;
        }
      }

      if (!apiSuccess) {
        console.warn("⚠️  BACKEND LIKES API NOT IMPLEMENTED");
        console.log("📝 Frontend is working in LOCAL SIMULATION MODE");
        console.log("🔧 To fix: Implement these endpoints in your backend:");
        console.log("   POST /discussion/api/posts/{id}/like");
        console.log("   DELETE /discussion/api/posts/{id}/like");
        console.log(
          "💡 Likes will persist in UI but not in database until backend is ready"
        );

        // Show user notification that backend isn't ready
        setPostResult(
          "⚠️ Like saved locally - backend API needed for persistence"
        );
        setTimeout(() => setPostResult(""), 3000);
      } else {
        // Update with actual backend response if available
        if (responseData && responseData.likes !== undefined) {
          console.log("✅ Backend like count updated:", responseData.likes);
          setLikeCounts((prev) => ({ ...prev, [postId]: responseData.likes }));
        }

        console.log("✅ LIKE SUCCESSFULLY SAVED TO BACKEND!");
      }
    } catch (err) {
      console.error("Error updating like:", err);
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

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setFeed([]);
    setLikedPosts(new Set());
    setLikeCounts({});
    setBackendSupportsLikes(false);
    setFormData({ userName: "", email: "", password: "", profileName: "" });

    // Clear localStorage
    localStorage.removeItem("chatSphereToken");
    localStorage.removeItem("chatSphereUser");
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

  if (!token) {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">ChatSphere</h1>
          <p className="app-subtitle">
            Connect, Share, and Engage with Your Community
          </p>
        </div>

        <div className="auth-container">
          <div className="auth-toggle">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="form-container">
            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="userName"
                    className="form-input"
                    placeholder="Username"
                    value={formData.userName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="profileName"
                    className="form-input"
                    placeholder="Display Name"
                    value={formData.profileName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {authResult && (
            <div className={`status-message ${getStatusClass(authResult)}`}>
              {authResult}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 className="navbar-title">ChatSphere</h1>
          <span className="navbar-tagline">Social Network</span>
        </div>
        <div className="navbar-center">
          <div className="navbar-user-badge">
            <div className="navbar-avatar">
              {getInitials(
                user?.username ||
                  user?.profileName ||
                  user?.userName ||
                  user?.email?.split("@")[0] ||
                  "User"
              )}
            </div>
            <div className="navbar-user-info">
              <div className="navbar-welcome-text">
                Welcome back,{" "}
                <span className="navbar-username">
                  {user?.username ||
                    user?.profileName ||
                    user?.userName ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </span>
              </div>
              <div className="navbar-user-email">{user?.email}</div>
            </div>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="navbar-user-status">
            <span className="status-indicator online"></span>
            <span className="status-text">Online</span>
          </div>
          <button className="navbar-logout" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="create-post-container">
          <h2 className="create-post-title">What's on your mind?</h2>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <textarea
                className="post-textarea"
                placeholder="Share your thoughts..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-button">
              Share Post
            </button>
          </form>

          {postResult && (
            <div className={`status-message ${getStatusClass(postResult)}`}>
              {postResult}
            </div>
          )}
        </div>

        <div className="feed-container">
          <div className="feed-header">
            <h2 className="feed-title">Feed</h2>
            <div className="feed-actions">
              <button className="refresh-button" onClick={handleFetchFeed}>
                Refresh
              </button>
              {!backendSupportsLikes && (
                <div className="backend-status">
                  <span className="status-indicator warning"></span>
                  <span className="status-text">Likes: Local Mode</span>
                </div>
              )}
              {backendSupportsLikes && (
                <div className="backend-status">
                  <span className="status-indicator success"></span>
                  <span className="status-text">Likes: Backend Ready</span>
                </div>
              )}
            </div>
          </div>

          {feedResult && (
            <div className={`status-message ${getStatusClass(feedResult)}`}>
              {feedResult}
            </div>
          )}

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

                // Debug logging for each post
                console.log(`Rendering post ${i}:`, {
                  postId,
                  isLiked,
                  likeCount,
                  item: item,
                });

                return (
                  <div key={i} className="post-item">
                    <div className="post-header">
                      <div className="post-avatar">
                        {getInitials(item.profileName)}
                      </div>
                      <div className="post-user-info">
                        <div className="post-username">
                          {item.profileName || "Anonymous"}
                        </div>
                        <div className="post-userid">
                          User ID: {item.userId}
                        </div>
                      </div>
                    </div>

                    <div className="post-content">
                      {item.post?.content || item.content}
                    </div>

                    <div className="post-actions">
                      <button
                        className={`action-button ${isLiked ? "liked" : ""}`}
                        onClick={() => handleLike(postId)}
                      >
                        <span className="action-icon">
                          {isLiked ? "❤️" : "🤍"}
                        </span>
                        <span className="action-text">
                          {likeCount > 0
                            ? `${likeCount} Like${likeCount > 1 ? "s" : ""}`
                            : "Like"}
                        </span>
                      </button>
                      <button
                        className="action-button"
                        onClick={() => {
                          setCommentingPostId(postId);
                          setCommentContent("");
                        }}
                      >
                        <span className="action-icon">💬</span>
                        <span className="action-text">Comment</span>
                      </button>
                    </div>

                    {item.post?.comments && item.post.comments.length > 0 && (
                      <div className="comments-section">
                        <div className="comments-title">
                          <span className="comments-icon">💬</span>
                          Comments ({item.post.comments.length})
                        </div>
                        {item.post.comments.map((comment, ci) => (
                          <div key={ci} className="comment-item">
                            <div className="comment-content">
                              {comment.content}
                            </div>
                            <div className="comment-author">
                              by user {comment.userId}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {commentingPostId === postId && (
                      <form
                        onSubmit={handleAddComment}
                        className="comment-form"
                      >
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Write a comment..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          required
                        />
                        <button type="submit" className="comment-button">
                          Post
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
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
      </div>
    </div>
  );
}

export default App;
