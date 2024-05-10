/*
  Warnings:

  - You are about to drop the `AuthKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `AuthKey`;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionID` VARCHAR(191) NOT NULL,
    `creds` VARCHAR(191) NULL,

    UNIQUE INDEX `sessions_id_key`(`id`),
    UNIQUE INDEX `sessions_sessionID_key`(`sessionID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
