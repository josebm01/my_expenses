-- Un préstamo puede tener varios montos ("Moto", "Préstamo de dinero"): el monto y la fecha pasan de
-- `loans` a `loan_items`, y el gasto generado se liga al monto en lugar de al préstamo.

-- CreateTable
CREATE TABLE "loan_items" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_items_loan_id_date_idx" ON "loan_items"("loan_id", "date");

-- AddForeignKey
ALTER TABLE "loan_items" ADD CONSTRAINT "loan_items_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cada préstamo existente se convierte en su primer monto.
INSERT INTO "loan_items" ("id", "loan_id", "concept", "amount", "date", "created_at")
SELECT gen_random_uuid(), "id", 'Préstamo', "amount", "date", "created_at" FROM "loans";

-- El gasto que generaba el préstamo ahora pertenece a ese monto.
ALTER TABLE "transactions" ADD COLUMN "loan_item_id" UUID;
UPDATE "transactions" AS t SET "loan_item_id" = i."id"
FROM "loan_items" AS i
WHERE t."loan_id" = i."loan_id";

-- CreateIndex
CREATE UNIQUE INDEX "transactions_loan_item_id_key" ON "transactions"("loan_item_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_item_id_fkey" FOREIGN KEY ("loan_item_id") REFERENCES "loan_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ya no se usan.
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_loan_id_fkey";
DROP INDEX "transactions_loan_id_key";
ALTER TABLE "transactions" DROP COLUMN "loan_id";
ALTER TABLE "loans" DROP COLUMN "amount", DROP COLUMN "date";
