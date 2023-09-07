/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_username_key" ON "Image"("username");
