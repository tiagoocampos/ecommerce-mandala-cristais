-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "first_purchase_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "announcement_text" TEXT NOT NULL DEFAULT '',
    "announcement_coupon_code" TEXT,
    "free_shipping_threshold" INTEGER,
    "trust_strip_items" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
