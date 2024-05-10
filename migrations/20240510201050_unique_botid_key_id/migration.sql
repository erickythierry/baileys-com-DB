/*
  Warnings:

  - A unique constraint covering the columns `[botId,keyId]` on the table `AuthKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AuthKey_botId_keyId_key` ON `AuthKey`(`botId`, `keyId`);
