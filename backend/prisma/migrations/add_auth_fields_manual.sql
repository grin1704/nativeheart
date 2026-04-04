-- Manual migration: Add email verification and OAuth fields to users table

-- Make password_hash nullable (for OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add email verification fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP;

-- Add password reset fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Add OAuth fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS users_verification_token_key ON users(verification_token);
CREATE UNIQUE INDEX IF NOT EXISTS users_reset_token_key ON users(reset_token);
CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_provider_oauth_id_key ON users(oauth_provider, oauth_id);

-- Update existing users to have email_verified = true
UPDATE users SET email_verified = true WHERE email_verified IS NULL OR email_verified = false;
