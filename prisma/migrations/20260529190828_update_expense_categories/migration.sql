-- Step 1: Create new enum type with updated values
CREATE TYPE "ExpenseCategory_new" AS ENUM (
  'PERSONAL_EXPENSE',
  'EDUCATION',
  'FOOD',
  'RECURRING',
  'SUBSCRIPTION',
  'LEISURE',
  'INVESTMENT',
  'HOUSE',
  'TRANSPORT',
  'OTHER'
);

-- Step 2: Migrate existing data and alter column to use new enum
-- Using CASE to map old values to new values
ALTER TABLE "Expense"
  ALTER COLUMN "category" TYPE "ExpenseCategory_new"
  USING (
    CASE category::text
      WHEN 'ENTERTAINMENT' THEN 'LEISURE'
      WHEN 'PERSONAL_PURCHASE' THEN 'OTHER'
      ELSE category::text
    END
  )::"ExpenseCategory_new";

-- Step 3: Drop old enum type
DROP TYPE "ExpenseCategory";

-- Step 4: Rename new enum type to original name
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
