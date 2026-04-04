-- Add auth fields to users table
ALTER TABLE users 
  ALTER COLUMN password_hash DROP NOT NULL,
  ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN verification_token VARCHAR(255) UNIQUE,
  ADD COLUMN verification_expires TIMESTAMP,
  ADD COLUMN reset_token VARCHAR(255) UNIQUE,
  ADD COLUMN reset_token_expires TIMESTAMP,
  ADD COLUMN oauth_provider VARCHAR(50),
  ADD COLUMN oauth_id VARCHAR(255);

-- Add unique constraint for OAuth
CREATE UNIQUE INDEX users_oauth_provider_oauth_id_key 
  ON users(oauth_provider, oauth_id) 
  WHERE oauth_provider IS NOT NULL AND oauth_id IS NOT NULL;
