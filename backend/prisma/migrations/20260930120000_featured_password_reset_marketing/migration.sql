-- AlterTable
ALTER TABLE "users" ADD COLUMN     "marketing_opt_out" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_password_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_password_token_key" ON "users"("reset_password_token");

