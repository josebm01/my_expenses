-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "palette" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_type_position_idx" ON "categories"("type", "position");

-- Categorías por defecto: mismos ids que usaban los movimientos cuando vivían en código.
INSERT INTO "categories" ("id", "type", "name", "icon", "palette", "position") VALUES
    ('groceries',     'expense', 'Alimentos',       'shopping-cart', 'orange', 0),
    ('shopping',      'expense', 'Compras',         'shopping-bag',  'blue',   1),
    ('health',        'expense', 'Salud',           'heart',         'teal',   2),
    ('entertainment', 'expense', 'Entretenimiento', 'ticket',        'purple', 3),
    ('transport',     'expense', 'Transporte',      'car',           'ochre',  4),
    ('home',          'expense', 'Hogar',           'house',         'slate',  5),
    ('utilities',     'expense', 'Servicios',       'zap',           'pink',   6),
    ('other',         'expense', 'Otro',            'ellipsis',      'gray',   7),
    ('salary',        'income',  'Sueldo',          'banknote',      'cyan',   0),
    ('freelance',     'income',  'Freelance',       'laptop',        'cyan',   1),
    ('sales',         'income',  'Ventas',          'tag',           'cyan',   2),
    ('refund',        'income',  'Reembolso',       'rotate-ccw',    'cyan',   3);

-- Antes los ids desconocidos se mostraban como "Otro"; se fijan así para poder crear la llave foránea.
UPDATE "transactions" SET "category_id" = 'other'
WHERE "category_id" NOT IN (SELECT "id" FROM "categories");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
