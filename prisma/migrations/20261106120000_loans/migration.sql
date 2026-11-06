-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "loan_id" UUID,
ADD COLUMN     "loan_payment_id" UUID;

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "borrower" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "count_in_totals" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_payments" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_payments_loan_id_date_idx" ON "loan_payments"("loan_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_loan_id_key" ON "transactions"("loan_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_loan_payment_id_key" ON "transactions"("loan_payment_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_payment_id_fkey" FOREIGN KEY ("loan_payment_id") REFERENCES "loan_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Categorías de sistema para los préstamos: el préstamo es un gasto y cada abono un ingreso.
-- No aparecen en "Nuevo movimiento" ni en /categories (ver SYSTEM_CATEGORY_IDS en src/lib/categories.ts).
INSERT INTO "categories" ("id", "type", "name", "icon", "palette", "position") VALUES
    ('loans',           'expense', 'Préstamos', 'hand-coins', 'brown', 1000),
    ('loan-repayments', 'income',  'Préstamos', 'hand-coins', 'cyan',  1000)
ON CONFLICT ("id") DO NOTHING;
