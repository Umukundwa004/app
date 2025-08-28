-- Create database and table
CREATE DATABASE IF NOT EXISTS edx_courses;

USE edx_courses;

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY,
  name TEXT,
  org VARCHAR(255)
);

