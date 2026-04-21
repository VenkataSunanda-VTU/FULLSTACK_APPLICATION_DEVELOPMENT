-- ============================================================
--  Job Portal – MySQL Setup Script
--  Run this ONCE before starting the application
-- ============================================================

-- 1. Create database
CREATE DATABASE IF NOT EXISTS job_portal_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE job_portal_db;

-- 2. (Optional) Create a dedicated DB user instead of using root
-- CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
-- GRANT ALL PRIVILEGES ON job_portal_db.* TO 'jobportal'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================
-- Tables are created automatically by Hibernate (ddl-auto=update)
-- This file only ensures the database exists.
-- ============================================================

SELECT 'Database job_portal_db is ready.' AS status;
