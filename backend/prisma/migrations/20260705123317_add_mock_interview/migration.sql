-- CreateTable
CREATE TABLE "MockInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "rounds" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "overallFeedback" TEXT,
    "verdict" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
