-- Clear sample data while preserving table structures
TRUNCATE TABLE "flagged_transactions" CASCADE;
TRUNCATE TABLE "transactions" CASCADE;
TRUNCATE TABLE "fraud_rules" CASCADE;

-- Keep only real user accounts, remove sample ones
DELETE FROM "users" 
WHERE email LIKE '%example%' 
   OR email LIKE '%test%' 
   OR email LIKE '%demo%';
