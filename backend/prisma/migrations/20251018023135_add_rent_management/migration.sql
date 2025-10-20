-- CreateEnum
CREATE TYPE "public"."RentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "public"."rents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."RentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rent_payments" (
    "id" TEXT NOT NULL,
    "rent_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rents_tenant_id_idx" ON "public"."rents"("tenant_id");

-- CreateIndex
CREATE INDEX "rents_room_id_idx" ON "public"."rents"("room_id");

-- CreateIndex
CREATE INDEX "rents_due_date_idx" ON "public"."rents"("due_date");

-- CreateIndex
CREATE INDEX "rents_status_idx" ON "public"."rents"("status");

-- CreateIndex
CREATE INDEX "rent_payments_rent_id_idx" ON "public"."rent_payments"("rent_id");

-- AddForeignKey
ALTER TABLE "public"."rents" ADD CONSTRAINT "rents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rents" ADD CONSTRAINT "rents_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rent_payments" ADD CONSTRAINT "rent_payments_rent_id_fkey" FOREIGN KEY ("rent_id") REFERENCES "public"."rents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
