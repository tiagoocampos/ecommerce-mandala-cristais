-- Retirada na loja: migration ADITIVA (nenhum dado existente é alterado)
-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('SHIPPING', 'PICKUP');

-- AlterTable: pedidos antigos continuam SHIPPING; endereço passa a ser opcional (retirada não tem)
ALTER TABLE "orders" ADD COLUMN "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'SHIPPING';
ALTER TABLE "orders" ALTER COLUMN "address_id" DROP NOT NULL;

-- AlterTable: configurações da retirada
ALTER TABLE "store_settings"
    ADD COLUMN "pickup_enabled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "pickup_address" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "pickup_instructions" TEXT NOT NULL DEFAULT '';
