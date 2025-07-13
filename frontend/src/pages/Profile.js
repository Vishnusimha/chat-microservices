import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiEdit, FiSave, FiX, FiActivity, FiCalendar, FiMessageCircle, FiHeart } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    joinDate: new Date().toLocaleDateString(),
    lastActive: new Date().toLocaleDateString()
  });
  const [editedProfile, setEditedProfile] = useState({
    profileName: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (user) {
      setEditedProfile({
        profileName: user.profileName || user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
      // TODO: Fetch user stats from backend
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    // Placeholder for fetching user statistics from backend
    // This would involve calling multiple endpoints to get user's post count, likes, etc.
    try {
      // const response = await fetch(`/api/users/${user.userId}/stats`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const stats = await response.json();
      // setUserStats(stats);
      
      // Mock data for now
      setUserStats({
        totalPosts: 12,
        totalLikes: 45,
        totalComments: 23,
        joinDate: '2024-01-15',
        lastActive: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API call
      // const response = await fetch(`/api/users/${user.userId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(editedProfile)
      // });
      
      console.log('Profile updated:', editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const achievements = [
    { name: 'First Post', description: 'Created your first post', earned: true },
    { name: 'Social Butterfly', description: 'Received 10+ likes', earned: userStats.totalLikes >= 10 },
    { name: 'Conversationalist', description: 'Made 20+ comments', earned: userStats.totalComments >= 20 },
    { name: 'Community Leader', description: 'Created 50+ posts', earned: userStats.totalPosts >= 50 },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {getInitials(user?.profileName || user?.username || user?.email)}
          </div>
          
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editedProfile.profileName}
                  onChange={(e) => setEditedProfile({...editedProfile, profileName: e.target.value})}
                  className="edit-input"
                  placeholder="Display Name"
                />
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  className="edit-textarea"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <input
                  type="text"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                  className="edit-input"
                  placeholder="Location"
                />
                <input
                  type="url"
                  value={editedProfile.website}
                  onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
                  className="edit-input"
                  placeholder="Website"
                />
                <div className="edit-actions">
                  <button onClick={handleSaveProfile} className="save-btn">
                    <FiSave /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <h1 className="profile-name">
                  {editedProfile.profileName || user?.username || 'User'}
                </h1>
                <p className="profile-email">
                  <FiMail /> {user?.email}
                </p>
                {editedProfile.bio && (
                  <p className="profile-bio">{editedProfile.bio}</p>
                )}
                {editedProfile.location && (
                  <p className="profile-location">📍 {editedProfile.location}</p>
                )}
                {editedProfile.website && (
                  <p className="profile-website">
                    🌐 <a href={editedProfile.website} target="_blank" rel="noopener noreferrer">
                      {editedProfile.website}
                    </a>
                  </p>
                )}
                <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                  <FiEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiMessageCircle />
              </div>
              <div className="stat-value">{userStats.totalPosts}</div>
              <div className="stat-label">Posts</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FiHeart />
              </div>
              <div className="stat-value">{userStats.totalLikes}</div>
              <div className="stat-label">Likes Received</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FiActivity />
              </div>
              <div className="stat-value">{userStats.totalComments}</div>
              <div className="stat-label">Comments</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FiCalendar />
              </div>
              <div className="stat-value">{new Date(userStats.joinDate).toLocaleDateString()}</div>
              <div className="stat-label">Joined</div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="achievements-section">
          <h2 className="section-title">🏆 Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.earned ? '🏆' : '🔒'}
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <div className="achievement-badge">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="activity-section">
          <h2 className="section-title">📊 Activity Summary</h2>
          <div className="activity-summary">
            <div className="activity-item">
              <span className="activity-label">Last Active:</span>
              <span className="activity-value">{userStats.lastActive}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Total Interactions:</span>
              <span className="activity-value">
                {userStats.totalPosts + userStats.totalComments + userStats.totalLikes}
              </span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Engagement Rate:</span>
              <span className="activity-value">
                {userStats.totalPosts > 0 
                  ? Math.round((userStats.totalLikes / userStats.totalPosts) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;