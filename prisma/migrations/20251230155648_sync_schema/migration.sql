/*
  Warnings:

  - You are about to drop the `ActiveSpawn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Battle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DraftHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LuckyHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCharacter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wishlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActiveSpawn" DROP CONSTRAINT "ActiveSpawn_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_challengerId_fkey";

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_opponentId_fkey";

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterVersion" DROP CONSTRAINT "CharacterVersion_characterId_fkey";

-- DropForeignKey
ALTER TABLE "DraftHistory" DROP CONSTRAINT "DraftHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Gift" DROP CONSTRAINT "Gift_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Gift" DROP CONSTRAINT "Gift_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- DropForeignKey
ALTER TABLE "LuckyHistory" DROP CONSTRAINT "LuckyHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_senderId_fkey";

-- DropForeignKey
ALTER TABLE "TradeItem" DROP CONSTRAINT "TradeItem_tradeId_fkey";

-- DropForeignKey
ALTER TABLE "TradeItem" DROP CONSTRAINT "TradeItem_userCharacterId_fkey";

-- DropForeignKey
ALTER TABLE "UserCharacter" DROP CONSTRAINT "UserCharacter_characterId_fkey";

-- DropForeignKey
ALTER TABLE "UserCharacter" DROP CONSTRAINT "UserCharacter_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserCharacter" DROP CONSTRAINT "UserCharacter_versionId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_userId_fkey";

-- DropTable
DROP TABLE "ActiveSpawn";

-- DropTable
DROP TABLE "Battle";

-- DropTable
DROP TABLE "Character";

-- DropTable
DROP TABLE "CharacterVersion";

-- DropTable
DROP TABLE "DraftHistory";

-- DropTable
DROP TABLE "Gift";

-- DropTable
DROP TABLE "GuildSettings";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "LuckyHistory";

-- DropTable
DROP TABLE "Trade";

-- DropTable
DROP TABLE "TradeItem";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserCharacter";

-- DropTable
DROP TABLE "Wishlist";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 1000,
    "bank" INTEGER NOT NULL DEFAULT 0,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastDaily" TIMESTAMP(3),
    "lastRoll" TIMESTAMP(3),
    "lastWork" TIMESTAMP(3),
    "rollsUsed" INTEGER NOT NULL DEFAULT 0,
    "claimsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastClaimReset" TIMESTAMP(3),
    "battleWins" INTEGER NOT NULL DEFAULT 0,
    "battleLosses" INTEGER NOT NULL DEFAULT 0,
    "battleRating" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "apiId" TEXT,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'common',
    "imageUrl" TEXT,
    "workName" TEXT,
    "workType" "WorkType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_versions" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_characters" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "versionId" INTEGER,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_spawns" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,
    "characterId" INTEGER NOT NULL,
    "versionId" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_spawns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" SERIAL NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_items" (
    "id" SERIAL NOT NULL,
    "tradeId" INTEGER NOT NULL,
    "userCharacterId" INTEGER NOT NULL,
    "isFromSender" BOOLEAN NOT NULL,

    CONSTRAINT "trade_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battles" (
    "id" SERIAL NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "winnerId" TEXT,
    "status" "BattleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" SERIAL NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lucky_history" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bet" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "payout" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lucky_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_history" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "picks" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draft_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_settings" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "spawnChannelId" TEXT,
    "logChannelId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "rollsPerHour" INTEGER NOT NULL DEFAULT 11,
    "claimsPerDay" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "characters_apiId_key" ON "characters"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "user_characters_userId_characterId_versionId_key" ON "user_characters"("userId", "characterId", "versionId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_characterId_key" ON "wishlists"("userId", "characterId");

-- CreateIndex
CREATE INDEX "active_spawns_guildId_channelId_idx" ON "active_spawns"("guildId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "items_userId_type_key" ON "items"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "shop_items_type_key" ON "shop_items"("type");

-- AddForeignKey
ALTER TABLE "character_versions" ADD CONSTRAINT "character_versions_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_characters" ADD CONSTRAINT "user_characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_characters" ADD CONSTRAINT "user_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_characters" ADD CONSTRAINT "user_characters_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "character_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_userCharacterId_fkey" FOREIGN KEY ("userCharacterId") REFERENCES "user_characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lucky_history" ADD CONSTRAINT "lucky_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_history" ADD CONSTRAINT "draft_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
