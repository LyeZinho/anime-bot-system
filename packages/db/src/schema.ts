import { pgTable, varchar, text, timestamp, integer, real, boolean, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'non-binary', 'other']);
export const roleEnum = pgEnum('role', ['protagonist', 'deuteragonist', 'antagonist', 'supporting', 'minor', 'other']);
export const categoryTypeEnum = pgEnum('category_type', [
  'personality_trait',
  'hair_color',
  'eye_color',
  'body_type',
  'archetype',
  'genre',
  'work_format',
  'work_tag'
]);
export const actionTypeEnum = pgEnum('action_type', [
  'roulette_spin',
  'character_obtained',
  'character_gifted',
  'character_traded',
  'favorite_added',
  'favorite_removed',
  'rating_submitted',
  'server_joined',
  'server_left',
  'user_registered',
  'collection_reset'
]);
export const obtainSourceEnum = pgEnum('obtain_source', ['roulette', 'gift', 'trade', 'event', 'admin']);

// Users
export const users = pgTable('users', {
  id: varchar('id', { length: 20 }).primaryKey(), // Discord ID
  username: varchar('username', { length: 255 }).notNull(),
  globalName: varchar('global_name', { length: 255 }),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Servers (Discord guilds)
export const servers = pgTable('servers', {
  id: varchar('id', { length: 20 }).primaryKey(), // Discord Guild ID
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: varchar('owner_id', { length: 20 }).notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User-Server relationship
export const userServers = pgTable('user_servers', {
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  role: varchar('role', { length: 50 }).default('member'), // admin, moderator, member
});

// Works (unified anime/manga)
export const works = pgTable('works', {
  id: varchar('id', { length: 255 }).primaryKey(), // internalId
  title: varchar('title', { length: 255 }).notNull(),
  altTitles: jsonb('alt_titles').$type<string[]>(),
  sourceAnimeId: integer('source_anime_id'),
  sourceMangaId: integer('source_manga_id'),
  popularity: integer('popularity').notNull().default(0),
  averageScore: integer('average_score'),
  formats: jsonb('formats').$type<string[]>(),
  genres: jsonb('genres').$type<string[]>(),
  tags: jsonb('tags').$type<string[]>(),
  coverImage: text('cover_image'),
  bannerImage: text('banner_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Category Types
export const categoryTypes = pgTable('category_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: categoryTypeEnum('type').notNull(),
  description: text('description'),
});

// Category Values
export const categoryValues = pgTable('category_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  typeId: uuid('type_id').notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  description: text('description'),
});

// Characters
export const characters = pgTable('characters', {
  anilistId: integer('anilist_id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  altNames: jsonb('alt_names').$type<string[]>(),
  description: text('description'),
  gender: genderEnum('gender'),
  role: roleEnum('role'),
  imageUrl: text('image_url'),
  popularity: integer('popularity').notNull().default(0),
  score: real('score').notNull().default(0),
  workId: varchar('work_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Character-Category Relations (many-to-many)
export const characterCategories = pgTable('character_categories', {
  characterId: integer('character_id').notNull(),
  categoryValueId: uuid('category_value_id').notNull(),
});

// Character Ratings (global website ratings)
export const characterRatings = pgTable('character_ratings', {
  characterId: integer('character_id').primaryKey(),
  totalVotes: integer('total_votes').notNull().default(0),
  averageRating: real('average_rating').notNull().default(0),
  sumRatings: integer('sum_ratings').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Favorites
export const userFavorites = pgTable('user_favorites', {
  userId: varchar('user_id', { length: 20 }).notNull(),
  characterId: integer('character_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Collection (character obtained by user in a server)
export const userCollections = pgTable('user_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }).notNull(),
  characterId: integer('character_id').notNull(),
  source: obtainSourceEnum('source').notNull().default('roulette'),
  obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
});

// Ledger (complete action log)
export const ledgerLogs = pgTable('ledger_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 20 }),
  serverId: varchar('server_id', { length: 20 }),
  actionType: actionTypeEnum('action_type').notNull(),
  characterId: integer('character_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Ratings (website 1-5 stars)
export const userRatings = pgTable('user_ratings', {
  userId: varchar('user_id', { length: 20 }).notNull(),
  characterId: integer('character_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(userFavorites),
  collections: many(userCollections),
  ratings: many(userRatings),
  serverMemberships: many(userServers),
}));

export const serversRelations = relations(servers, ({ many }) => ({
  members: many(userServers),
  collections: many(userCollections),
}));

export const worksRelations = relations(works, ({ many }) => ({
  characters: many(characters),
}));

export const categoryTypesRelations = relations(categoryTypes, ({ many }) => ({
  values: many(categoryValues),
}));

export const categoryValuesRelations = relations(categoryValues, ({ one }) => ({
  type: one(categoryTypes, {
    fields: [categoryValues.typeId],
    references: [categoryTypes.id],
  }),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  work: one(works, {
    fields: [characters.workId],
    references: [works.id],
  }),
  categories: many(characterCategories),
  ratings: many(characterRatings),
  favorites: many(userFavorites),
  collections: many(userCollections),
}));

export const characterCategoriesRelations = relations(characterCategories, ({ one }) => ({
  character: one(characters, {
    fields: [characterCategories.characterId],
    references: [characters.anilistId],
  }),
  categoryValue: one(categoryValues, {
    fields: [characterCategories.categoryValueId],
    references: [categoryValues.id],
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [userFavorites.characterId],
    references: [characters.anilistId],
  }),
}));

export const userCollectionsRelations = relations(userCollections, ({ one }) => ({
  user: one(users, {
    fields: [userCollections.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [userCollections.serverId],
    references: [servers.id],
  }),
  character: one(characters, {
    fields: [userCollections.characterId],
    references: [characters.anilistId],
  }),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [userRatings.characterId],
    references: [characters.anilistId],
  }),
}));

export const ledgerLogsRelations = relations(ledgerLogs, ({ one }) => ({
  user: one(users, {
    fields: [ledgerLogs.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [ledgerLogs.serverId],
    references: [servers.id],
  }),
  character: one(characters, {
    fields: [ledgerLogs.characterId],
    references: [characters.anilistId],
  }),
}));

// === INDEXES ===

// Ranking indexes
export const charactersPopularityIndex = pgTable('characters_popularity_idx', {
  // Partial index for ranking queries
  characterId: integer('character_id').notNull(),
  popularity: integer('popularity').notNull(),
  score: real('score').notNull(),
  gender: genderEnum('gender'),
  role: roleEnum('role'),
});

export const charactersRatingIndex = pgTable('characters_rating_idx', {
  characterId: integer('character_id').notNull(),
  averageRating: real('average_rating').notNull(),
  totalVotes: integer('total_votes').notNull(),
});

export const characterWorkIndex = pgTable('character_work_idx', {
  characterId: integer('character_id').notNull(),
  workId: varchar('work_id', { length: 100 }).notNull(),
});

// User collection indexes
export const userServerCollectionIndex = pgTable('user_server_collection_idx', {
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }).notNull(),
  characterId: integer('character_id').notNull(),
});
