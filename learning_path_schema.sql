-- Additive schema for personalized learning paths.
-- Run after querySQL.sql and before using /api/learning-path.

CREATE TABLE IF NOT EXISTS learning_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    survey_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_learning_profile_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    encouragement VARCHAR(500) NOT NULL,
    goal VARCHAR(50) NOT NULL,
    generated_by VARCHAR(30) NOT NULL DEFAULT 'rules',
    status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_learning_path_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_learning_path_user_status (user_id, status)
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    path_id INT NOT NULL,
    algorithm_id INT NOT NULL,
    position INT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    checkpoint VARCHAR(300) NOT NULL,
    estimated_minutes INT NOT NULL DEFAULT 30,
    status ENUM('locked', 'available', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'locked',
    CONSTRAINT fk_learning_step_path
      FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    CONSTRAINT fk_learning_step_algorithm
      FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE,
    UNIQUE KEY uq_learning_path_position (path_id, position),
    INDEX idx_learning_step_algorithm (algorithm_id)
);
