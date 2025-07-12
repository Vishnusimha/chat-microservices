-- Create database if not exists
CREATE DATABASE IF NOT EXISTS chat_microservices;

-- Use the database
USE chat_microservices;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    post_id BIGINT,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (user_name, email, password, profile_name) VALUES
('john_doe', 'john.doe@example.com', '$2a$10$example_hashed_password', 'John Doe'),
('jane_smith', 'jane.smith@example.com', '$2a$10$example_hashed_password', 'Jane Smith')
ON DUPLICATE KEY UPDATE user_name = VALUES(user_name);

INSERT INTO posts (content, likes, user_id) VALUES
('Welcome to our microservices chat application!', 5, 1),
('This is a sample post for testing.', 2, 2)
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT INTO comments (content, post_id, user_id) VALUES
('Great post!', 1, 2),
('Thanks for sharing!', 1, 1),
('Looking forward to more content.', 2, 1)
ON DUPLICATE KEY UPDATE content = VALUES(content);