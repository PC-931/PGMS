/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `rooms` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."rooms" DROP CONSTRAINT "rooms_tenant_id_fkey";

-- AlterTable
ALTER TABLE "public"."rooms" DROP COLUMN "tenant_id";

-- CreateTable
CREATE TABLE "public"."_RoomTenants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomTenants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoomTenants_B_index" ON "public"."_RoomTenants"("B");

-- AddForeignKey
ALTER TABLE "public"."_RoomTenants" ADD CONSTRAINT "_RoomTenants_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoomTenants" ADD CONSTRAINT "_RoomTenants_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
