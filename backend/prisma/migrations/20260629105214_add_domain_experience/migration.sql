/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Analysis` table. All the data in the column will be lost.
  - The `skills` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `missingSkills` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `suggestions` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "createdAt",
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "atsScore" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[],
DROP COLUMN "missingSkills",
ADD COLUMN     "missingSkills" TEXT[],
DROP COLUMN "suggestions",
ADD COLUMN     "suggestions" TEXT[];
