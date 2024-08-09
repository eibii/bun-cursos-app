-- CreateTable
CREATE TABLE "Blacklist" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userUUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" VARCHAR(167) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "nickname" VARCHAR(80),
    "avatar" TEXT,
    "lastAccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedToken" TEXT,
    "verifiedExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authentication" (
    "token" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "icon" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "promptText" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "urlFile" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Blacklist_uuid_idx" ON "Blacklist"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_slug_key" ON "profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_uuid_userId_idx" ON "profiles"("uuid", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_uuid_email_idx" ON "users"("uuid", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_token_key" ON "Authentication"("token");

-- CreateIndex
CREATE INDEX "Authentication_token_idx" ON "Authentication"("token");

-- CreateIndex
CREATE UNIQUE INDEX "groups_userId_key" ON "groups"("userId");

-- CreateIndex
CREATE INDEX "groups_uuid_userId_name_idx" ON "groups"("uuid", "userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chats_filename_key" ON "chats"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "chats_userId_key" ON "chats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chats_groupId_key" ON "chats"("groupId");

-- CreateIndex
CREATE INDEX "chats_uuid_userId_groupId_filename_idx" ON "chats"("uuid", "userId", "groupId", "filename");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
