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
