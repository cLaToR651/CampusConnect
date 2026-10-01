-- CampusConnect database schema
-- This file defines tables only. `npm run db:migrate` creates the database
-- named by DB_NAME in server/.env before applying these tables.

CREATE TABLE IF NOT EXISTS departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    username VARCHAR(50) NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) NULL AFTER name;
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS uq_users_username (username);

CREATE TABLE IF NOT EXISTS programs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(30),
  duration_years TINYINT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_program_department FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_program_department_name (department_id, name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semesters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id INT UNSIGNED NOT NULL,
  semester_number TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_semester_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE CASCADE,
  UNIQUE KEY uq_semester_program_number (program_id, semester_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'club_coordinator', 'admin') NOT NULL DEFAULT 'student',
  department_id INT UNSIGNED NULL,
  program_id INT UNSIGNED NULL,
  semester_id INT UNSIGNED NULL,
  academic_year ENUM('1st', '2nd', '3rd', '4th') NULL,
  bio TEXT,
  skills JSON NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_department FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_semester FOREIGN KEY (semester_id)
    REFERENCES semesters(id) ON DELETE SET NULL,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_badges (
  user_id INT UNSIGNED NOT NULL,
  badge VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge),
  CONSTRAINT fk_badge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS friend_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'blocked') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_request_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_friend_request (sender_id, receiver_id),
  KEY idx_friend_receiver (receiver_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS global_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_global_message_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_global_messages (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS direct_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_direct_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_direct_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_direct_conversation (sender_id, receiver_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type ENUM('notes', 'ppt', 'pdf', 'syllabus', 'previous_paper', 'other') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  department_id INT UNSIGNED NOT NULL,
  program_id INT UNSIGNED NULL,
  semester_id INT UNSIGNED NULL,
  subject_name VARCHAR(150) NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resource_department FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_resource_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE SET NULL,
  CONSTRAINT fk_resource_semester FOREIGN KEY (semester_id)
    REFERENCES semesters(id) ON DELETE SET NULL,
  CONSTRAINT fk_resource_uploader FOREIGN KEY (uploaded_by)
    REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_resources_filter (department_id, program_id, semester_id, resource_type, status),
  KEY idx_resources_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clubs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NULL,
  logo_url VARCHAR(500) NULL,
  contact_email VARCHAR(255) NULL,
  instagram_url VARCHAR(500) NULL,
  is_recruiting BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_club_creator FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_clubs_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS club_memberships (
  club_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('member', 'coordinator', 'lead') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (club_id, user_id),
  CONSTRAINT fk_membership_club FOREIGN KEY (club_id)
    REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_membership_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS club_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  club_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_club FOREIGN KEY (club_id)
    REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_club_messages (club_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_type ENUM('workshop', 'hackathon', 'competition', 'seminar', 'cultural', 'sports', 'other') NOT NULL DEFAULT 'other',
  department_id INT UNSIGNED NULL,
  club_id INT UNSIGNED NULL,
  organizer_id INT UNSIGNED NOT NULL,
  venue VARCHAR(255) NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  registration_url VARCHAR(500) NULL,
  registration_deadline DATETIME NULL,
  requires_team BOOLEAN NOT NULL DEFAULT FALSE,
  min_team_size TINYINT UNSIGNED NULL,
  max_team_size TINYINT UNSIGNED NULL,
  status ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_department FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_club FOREIGN KEY (club_id)
    REFERENCES clubs(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id)
    REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_events_calendar (status, starts_at),
  KEY idx_events_department (department_id, starts_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('registered', 'waitlisted', 'cancelled') NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registration_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_registration_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_event_registration (event_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teams (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  required_skills JSON NULL,
  created_by INT UNSIGNED NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_team_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_creator FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_team_event_name (event_id, name),
  KEY idx_teams_open (event_id, is_open)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('leader', 'member') NOT NULL DEFAULT 'member',
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  CONSTRAINT fk_team_member_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_member_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experience_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSON NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON DELETE SET NULL,
  KEY idx_posts_published (is_published, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id INT UNSIGNED NOT NULL,
  author_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id)
    REFERENCES experience_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_comments_post (post_id, created_at)
) ENGINE=InnoDB;
