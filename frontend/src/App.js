import React, { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8765"; // API Gateway base URL

function App() {
  // Auth state
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null); // {userId, username, ...}
  // Registration state
  const [regUserName, setRegUserName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regProfileName, setRegProfileName] = useState("");
  const [regResult, setRegResult] = useState("");
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginResult, setLoginResult] = useState("");
  // Feed state
  const [feed, setFeed] = useState([]);
  const [feedResult, setFeedResult] = useState("");
  // Post creation state
  const [postContent, setPostContent] = useState("");
  const [postResult, setPostResult] = useState("");
  // Comment state
  const [commentContent, setCommentContent] = useState("");
  const [commentResult, setCommentResult] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegResult("Registering...");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: regUserName,
          email: regEmail,
          password: regPassword,
          profileName: regProfileName,
        }),
      });
      const data = await res.json();
      if (res.ok) setRegResult("Registration successful!");
      else setRegResult(data.message || data.error || "Registration failed");
    } catch (err) {
      setRegResult("Error: " + err.message);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginResult("Logging in...");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setUser(data);
        setLoginResult("Login successful!");
      } else {
        setLoginResult(data.message || data.error || "Login failed");
      }
    } catch (err) {
      setLoginResult("Error: " + err.message);
    }
  };

  // Fetch feed
  const handleFetchFeed = async () => {
    setFeedResult("Loading feed...");
    try {
      const res = await fetch(`${API_BASE}/feed/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFeed(data);
        setFeedResult("");
      } else {
        setFeed([]);
        setFeedResult("Failed to load feed");
      }
    } catch (err) {
      setFeedResult("Error: " + err.message);
    }
  };

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
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
        setPostResult("Post created!");
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

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
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

  return (
    <div
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Username"
          value={regUserName}
          onChange={(e) => setRegUserName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          required
        />
        <input
          placeholder="Profile Name"
          value={regProfileName}
          onChange={(e) => setRegProfileName(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <div>{regResult}</div>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <div>{loginResult}</div>

      {token && (
        <>
          <h2>Feed</h2>
          <button onClick={handleFetchFeed}>Load Feed</button>
          <div>{feedResult}</div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {feed.map((item, i) => (
              <li
                key={i}
                style={{
                  border: "1px solid #ccc",
                  margin: "1rem 0",
                  padding: "1rem",
                  borderRadius: 8,
                }}
              >
                <div>
                  <b>{item.profileName || "User"}</b>
                </div>
                <div>{item.post?.content || item.content}</div>
                <div style={{ fontSize: "0.9em", color: "#555" }}>
                  User ID: {item.userId}
                </div>
                {item.post?.comments && item.post.comments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <b>Comments:</b>
                    <ul style={{ paddingLeft: 20 }}>
                      {item.post.comments.map((c, ci) => (
                        <li key={ci}>
                          {c.content}{" "}
                          <span style={{ color: "#888" }}>
                            by user {c.userId}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setCommentingPostId(item.post?.id || item.id);
                    setCommentContent("");
                  }}
                >
                  Comment
                </button>
                {commentingPostId === (item.post?.id || item.id) && (
                  <form onSubmit={handleAddComment} style={{ marginTop: 8 }}>
                    <input
                      placeholder="Comment"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    />
                    <button type="submit">Add</button>
                    <button
                      type="button"
                      onClick={() => setCommentingPostId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>

          <h2>Create Post</h2>
          <form onSubmit={handleCreatePost}>
            <input
              placeholder="Post content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
            />
            <button type="submit">Post</button>
          </form>
          <div>{postResult}</div>
          <div>{commentResult}</div>
        </>
      )}
    </div>
  );
}

export default App;
