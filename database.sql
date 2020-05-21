DROP DATABASE IF EXISTS recipesmanager;
CREATE DATABASE recipesmanager;

CREATE TABLE "chefs" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "avatar_url" varchar,
  "created_at" timestamp
);

CREATE TABLE "files" (
  "id" int PRIMARY KEY,
  "path" varchar,
  "id_recipe" int,
  "created_at" varchar
);

CREATE TABLE "recipes" (
  "id" int PRIMARY KEY,
  "title" varchar,
  "additional_info" varchar,
  "created_at" timestamp,
  "id_chef" int
);

CREATE TABLE "ingred_recipes" (
  "id" int PRIMARY KEY,
  "description" varchar,
  "id_recipe" int
);

CREATE TABLE "method_of_preparation" (
  "id" int PRIMARY KEY,
  "description" varchar,
  "id_recipe" int
);

ALTER TABLE "method_of_preparation" ADD FOREIGN KEY ("id_recipe") REFERENCES "recipes" ("id") ON DELETE CASCADE;
ALTER TABLE "files" ADD FOREIGN KEY ("id_recipe") REFERENCES "recipes" ("id") ON DELETE CASCADE;
ALTER TABLE "ingred_recipes" ADD FOREIGN KEY ("id_recipe") REFERENCES "recipes" ("id") ON DELETE CASCADE;
ALTER TABLE "recipes" ADD FOREIGN KEY ("id_chef") REFERENCES "chefs" ("id") ON DELETE CASCADE;
ALTER TABLE "recipes" ADD FOREIGN KEY ("id_user") REFERENCES "users" ("id") ON DELETE CASCADE;

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "reset_token" TEXT,
  "reset_token_expires" TEXT,
  "is_admin" BOOLEAN DEFAULT false,
  "created_at" timestamp DEFAULT(now()),
  "updated_at" timestamp DEFAULT(now()),
  "status" INTEGER DEFAULT(0)
);

-- Foreign Key
ALTER TABLE "recipes" ADD FOREIGN KEY ("id_user") REFERENCES "users" ("id");

-- Procedure
CREATE FUNCTION trigger_set_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
RETURN NULL;
$$ LANGUAGE plpgsql;

-- Auto updated_at user
CREATE TRIGGER trigger_set_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Create table de session
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");