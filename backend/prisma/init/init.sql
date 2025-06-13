-- Create the database if it doesn't exist
CREATE DATABASE geotech;

-- Connect to the database
\c geotech;

-- Create the user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = current_setting('POSTGRES_USER')) THEN
      EXECUTE format('CREATE USER %I WITH PASSWORD %L', 
        current_setting('POSTGRES_USER'), 
        current_setting('POSTGRES_PASSWORD'));
   END IF;
END
$do$;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE geotech TO current_setting('POSTGRES_USER');
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_setting('POSTGRES_USER');
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO current_setting('POSTGRES_USER');
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO current_setting('POSTGRES_USER');

-- Make sure the user has access to the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO current_setting('POSTGRES_USER');
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO current_setting('POSTGRES_USER');
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO current_setting('POSTGRES_USER'); 
