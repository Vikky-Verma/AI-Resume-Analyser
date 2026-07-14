-- CreateTable
CREATE TABLE "CompanyPrepProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "solvedIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyPrepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPrepProgress_userId_company_key" ON "CompanyPrepProgress"("userId", "company");

-- AddForeignKey
ALTER TABLE "CompanyPrepProgress" ADD CONSTRAINT "CompanyPrepProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
