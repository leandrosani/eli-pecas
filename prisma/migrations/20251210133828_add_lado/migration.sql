/*
  Warnings:

  - Added the required column `lado` to the `Peca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Peca" ADD COLUMN     "lado" TEXT NOT NULL;
