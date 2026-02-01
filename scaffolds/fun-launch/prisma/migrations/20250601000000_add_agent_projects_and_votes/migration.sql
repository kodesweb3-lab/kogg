-- CreateTable
CREATE TABLE "AgentProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,
    "python" TEXT,
    "authorWallet" TEXT,
    "authorLabel" TEXT,
    "language" TEXT,
    "thumbnail" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "voterKey" TEXT NOT NULL,
    "voterWallet" TEXT,
    "voterLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentProject_createdAt_idx" ON "AgentProject"("createdAt");

-- CreateIndex
CREATE INDEX "AgentProject_authorWallet_idx" ON "AgentProject"("authorWallet");

-- CreateIndex
CREATE INDEX "AgentProject_authorLabel_idx" ON "AgentProject"("authorLabel");

-- CreateIndex
CREATE INDEX "AgentProject_voteCount_idx" ON "AgentProject"("voteCount");

-- CreateIndex
CREATE INDEX "ProjectVote_projectId_idx" ON "ProjectVote"("projectId");

-- CreateIndex
CREATE INDEX "ProjectVote_voterWallet_idx" ON "ProjectVote"("voterWallet");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVote_projectId_voterKey_key" ON "ProjectVote"("projectId", "voterKey");

-- AddForeignKey
ALTER TABLE "ProjectVote" ADD CONSTRAINT "ProjectVote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AgentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
