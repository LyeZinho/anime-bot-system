CREATE TYPE "public"."action_type" AS ENUM('roulette_spin', 'character_obtained', 'character_gifted', 'character_traded', 'favorite_added', 'favorite_removed', 'rating_submitted', 'server_joined', 'server_left', 'user_registered', 'collection_reset');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('personality_trait', 'hair_color', 'eye_color', 'body_type', 'archetype', 'genre', 'work_format', 'work_tag');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary', 'other');--> statement-breakpoint
CREATE TYPE "public"."obtain_source" AS ENUM('roulette', 'gift', 'trade', 'event', 'admin');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('protagonist', 'deuteragonist', 'antagonist', 'supporting', 'minor', 'other');--> statement-breakpoint
CREATE TABLE "category_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "category_type" NOT NULL,
	"description" text,
	CONSTRAINT "category_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "category_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"value" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "character_categories" (
	"character_id" integer NOT NULL,
	"category_value_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_ratings" (
	"character_id" integer PRIMARY KEY NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"average_rating" real DEFAULT 0 NOT NULL,
	"sum_ratings" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_work_idx" (
	"character_id" integer NOT NULL,
	"work_id" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"anilist_id" integer PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"alt_names" jsonb,
	"description" text,
	"gender" "gender",
	"role" "role",
	"image_url" text,
	"popularity" integer DEFAULT 0 NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"work_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters_popularity_idx" (
	"character_id" integer NOT NULL,
	"popularity" integer NOT NULL,
	"score" real NOT NULL,
	"gender" "gender",
	"role" "role"
);
--> statement-breakpoint
CREATE TABLE "characters_rating_idx" (
	"character_id" integer NOT NULL,
	"average_rating" real NOT NULL,
	"total_votes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(20),
	"server_id" varchar(20),
	"action_type" "action_type" NOT NULL,
	"character_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" varchar(20) NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"server_id" varchar(20) NOT NULL,
	"character_id" integer NOT NULL,
	"source" "obtain_source" DEFAULT 'roulette' NOT NULL,
	"obtained_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"user_id" varchar(20) NOT NULL,
	"character_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_ratings" (
	"user_id" varchar(20) NOT NULL,
	"character_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_server_collection_idx" (
	"user_id" varchar(20) NOT NULL,
	"server_id" varchar(20) NOT NULL,
	"character_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_servers" (
	"user_id" varchar(20) NOT NULL,
	"server_id" varchar(20) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"role" varchar(50) DEFAULT 'member'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"global_name" varchar(255),
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"alt_titles" jsonb,
	"source_anime_id" integer,
	"source_manga_id" integer,
	"popularity" integer DEFAULT 0 NOT NULL,
	"average_score" integer,
	"formats" jsonb,
	"genres" jsonb,
	"tags" jsonb,
	"cover_image" text,
	"banner_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
