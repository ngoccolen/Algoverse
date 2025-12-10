CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    reset_token VARCHAR(255),
    otp_code VARCHAR(10),
    otp_expire DATETIME,
    bio TEXT,
    location VARCHAR(100),
    avatar VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    token VARCHAR(255),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE algorithms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alg_key VARCHAR(50),
    name VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    pseudo_code LONGTEXT,
    steps JSON,
    time_complexity VARCHAR(25),
    space_complexity VARCHAR(25),
    code_examples JSON,
    created_at TIMESTAMP
);

CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    algorithm_id INT,
    question TEXT,
    options JSON,
    explanation TEXT,
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id)
);

CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    algorithm_id INT,
    progress INT,
    exercises_progress INT,
    questions_progress INT,
    last_accessed TIMESTAMP,
    status VARCHAR(50),
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id)
);

CREATE TABLE exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    difficulty VARCHAR(50),
    category VARCHAR(100),
    total_submissions INT,
    solved TINYINT(1),
    algorithm_id INT,
    solution_description TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id)
);

CREATE TABLE problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    difficulty VARCHAR(50),
    category VARCHAR(100),
    content_html MEDIUMTEXT,
    sample_input TEXT,
    sample_output TEXT,
    total_submissions INT,
    solved INT,
    is_public TINYINT(1)
);

CREATE TABLE test_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT,
    input_text TEXT,
    output_text TEXT,
    is_hidden TINYINT(1),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    exercise_id INT,
    problem_id INT,
    language_id INT,
    source_code TEXT,
    status VARCHAR(50),
    passed_cases INT,
    total_cases INT,
    time_taken FLOAT,
    memory_used FLOAT,
    submitted_at TIMESTAMP,
    created_at DATETIME,
    contest_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE contests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    start_time DATETIME,
    end_time DATETIME,
    difficulty VARCHAR(50),
    participants INT,
    prize VARCHAR(255)
);

CREATE TABLE contest_problems (
    contest_id INT,
    problem_id INT,
    points INT,
    PRIMARY KEY (contest_id, problem_id),
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE contest_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contest_id INT,
    user_id INT,
    registered_at TIMESTAMP,
    score INT,
    penalty INT,
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255),
    content TEXT,
    tags VARCHAR(255),
    views INT,
    status ENUM('draft','published'),
    created_at TIMESTAMP,
    image_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    content TEXT,
    is_accepted TINYINT(1),
    created_at TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE post_likes (
    user_id INT,
    post_id INT,
    created_at TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
