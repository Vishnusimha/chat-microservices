import React, { useState } from 'react';
import { FiGrid, FiFilter, FiSearch, FiTrendingUp, FiMessageSquare, FiAlertTriangle, FiInfo, FiFlag, FiHelpCircle, FiThumbsUp } from 'react-icons/fi';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { 
      id: 'all',
      name: 'All Posts', 
      icon: FiGrid,
      color: '#667eea',
      count: 245,
      description: 'View all community posts'
    },
    { 
      id: 'general',
      name: 'General Discussion', 
      icon: FiMessageSquare,
      color: '#667eea',
      count: 89,
      description: 'General community conversations'
    },
    { 
      id: 'complaint',
      name: 'Complaints & Issues', 
      icon: FiAlertTriangle,
      color: '#e53e3e',
      count: 45,
      description: 'Report problems and issues'
    },
    { 
      id: 'suggestion',
      name: 'Suggestions', 
      icon: FiInfo,
      color: '#48bb78',
      count: 67,
      description: 'Ideas for improvement'
    },
    { 
      id: 'announcement',
      name: 'Announcements', 
      icon: FiFlag,
      color: '#ed8936',
      count: 23,
      description: 'Official announcements'
    },
    { 
      id: 'question',
      name: 'Questions & Help', 
      icon: FiHelpCircle,
      color: '#38b2ac',
      count: 34,
      description: 'Ask questions and get help'
    },
    { 
      id: 'appreciation',
      name: 'Appreciation', 
      icon: FiThumbsUp,
      color: '#d69e2e',
      count: 12,
      description: 'Show appreciation and gratitude'
    },
  ];

  const mockPosts = [
    {
      id: 1,
      title: "Improve the community center wifi",
      category: "suggestion",
      author: "Sarah Johnson",
      date: "2024-01-15",
      status: "in-progress",
      likes: 23,
      comments: 8,
      priority: "medium"
    },
    {
      id: 2,
      title: "Broken streetlight on Oak Street",
      category: "complaint",
      author: "Mike Chen",
      date: "2024-01-14",
      status: "open",
      likes: 15,
      comments: 4,
      priority: "high"
    },
    {
      id: 3,
      title: "New recycling program announcement",
      category: "announcement",
      author: "Community Admin",
      date: "2024-01-13",
      status: "closed",
      likes: 45,
      comments: 12,
      priority: "low"
    },
    {
      id: 4,
      title: "How to register for community events?",
      category: "question",
      author: "Anonymous",
      date: "2024-01-12",
      status: "resolved",
      likes: 8,
      comments: 6,
      priority: "low"
    },
    {
      id: 5,
      title: "Thank you to the maintenance team",
      category: "appreciation",
      author: "Lisa Wong",
      date: "2024-01-11",
      status: "closed",
      likes: 34,
      comments: 15,
      priority: "low"
    }
  ];

  const statusColors = {
    'open': '#e53e3e',
    'in-progress': '#ed8936',
    'resolved': '#48bb78',
    'closed': '#a0aec0'
  };

  const priorityColors = {
    'high': '#e53e3e',
    'medium': '#ed8936',
    'low': '#48bb78'
  };

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date) - new Date(a.date);
      case 'popular':
        return (b.likes + b.comments) - (a.likes + a.comments);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  const getCategoryData = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getStatusBadge = (status) => {
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: `${statusColors[status]}20`,
          color: statusColors[status],
          border: `1px solid ${statusColors[status]}40`
        }}
      >
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    return (
      <span 
        className="priority-badge"
        style={{ 
          backgroundColor: `${priorityColors[priority]}20`,
          color: priorityColors[priority],
          border: `1px solid ${priorityColors[priority]}40`
        }}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-content">
          <h1><FiGrid /> Post Categories</h1>
          <p>Organize and browse community posts by category</p>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <FiFilter className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="categories-content">
        {/* Category Grid */}
        <div className="categories-grid">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <div
                key={category.id}
                className={`category-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ 
                  borderColor: isSelected ? category.color : 'transparent',
                  backgroundColor: isSelected ? `${category.color}10` : 'transparent'
                }}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  <Icon />
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-stats">
                    <span className="post-count">{category.count} posts</span>
                    {category.id !== 'all' && (
                      <FiTrendingUp className="trending-icon" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Posts List */}
        <div className="posts-section">
          <div className="section-header">
            <h2>
              {selectedCategory === 'all' ? 'All Posts' : getCategoryData(selectedCategory).name}
              <span className="result-count">({sortedPosts.length} posts)</span>
            </h2>
          </div>

          {sortedPosts.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon">
                {selectedCategory === 'all' ? <FiGrid /> : React.createElement(getCategoryData(selectedCategory).icon)}
              </div>
              <h3>No posts found</h3>
              <p>
                {searchTerm 
                  ? `No posts match "${searchTerm}" in this category`
                  : `No posts in ${getCategoryData(selectedCategory).name} yet`
                }
              </p>
            </div>
          ) : (
            <div className="posts-list">
              {sortedPosts.map(post => {
                const categoryData = getCategoryData(post.category);
                const CategoryIcon = categoryData.icon;
                
                return (
                  <div key={post.id} className="post-item">
                    <div className="post-header">
                      <div className="post-category-badge" style={{ backgroundColor: categoryData.color }}>
                        <CategoryIcon className="category-icon" />
                        <span>{categoryData.name}</span>
                      </div>
                      <div className="post-badges">
                        {getPriorityBadge(post.priority)}
                        {getStatusBadge(post.status)}
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <div className="post-meta">
                        <span className="post-author">by {post.author}</span>
                        <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="post-stats">
                      <div className="stat-item">
                        <FiThumbsUp className="stat-icon" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="stat-item">
                        <FiMessageSquare className="stat-icon" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;