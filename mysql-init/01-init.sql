-- Initialize MySQL database for Chat Microservices
CREATE DATABASE IF NOT EXISTS discussiondb;
CREATE DATABASE IF NOT EXISTS feeddb;

-- Grant permissions to app user for both databases
GRANT ALL PRIVILEGES ON discussiondb.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON feeddb.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Create some initial data if needed
-- You can add initial data here if required
