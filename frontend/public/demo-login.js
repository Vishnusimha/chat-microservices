// Quick demo mode for showcasing enhanced features
const demoUser = {
  userId: 1,
  username: "demouser", 
  email: "demo@example.com",
  profileName: "Demo User"
};
const demoToken = "demo-jwt-token";
localStorage.setItem("chatSphereToken", demoToken);
localStorage.setItem("chatSphereUser", JSON.stringify(demoUser));
window.location.reload();
