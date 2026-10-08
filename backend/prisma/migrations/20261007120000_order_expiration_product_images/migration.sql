-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "product_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: pedidos pendentes antigos ganham prazo de 30 min a partir da criação.
-- Na primeira execução do job de expiração, os que já passaram do prazo são cancelados
-- e o estoque deles volta.
UPDATE "orders" SET "expires_at" = "createdAt" + interval '30 minutes' WHERE "status" = 'PENDING' AND "expires_at" IS NULL;
