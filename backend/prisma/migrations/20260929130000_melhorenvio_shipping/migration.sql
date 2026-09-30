-- AlterTable
ALTER TABLE "products" ADD COLUMN     "height_cm" INTEGER,
ADD COLUMN     "length_cm" INTEGER,
ADD COLUMN     "weight_grams" INTEGER,
ADD COLUMN     "width_cm" INTEGER;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_cost_estimated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shipping_delivery_days" INTEGER,
ADD COLUMN     "shipping_service" TEXT;

-- CreateTable
CREATE TABLE "integration_tokens" (
    "provider" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_tokens_pkey" PRIMARY KEY ("provider")
);

