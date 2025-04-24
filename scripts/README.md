# Clear Sample Data Instructions

To clear the sample data from your Supabase database, follow these steps:

1. Log in to your Supabase dashboard (https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Create a new query and paste the following SQL:

```sql
-- Clear flagged transactions first due to foreign key constraints
TRUNCATE TABLE "flagged_transactions" CASCADE;

-- Clear main tables
TRUNCATE TABLE "transactions" CASCADE;
TRUNCATE TABLE "fraud_rules" CASCADE;

-- Remove sample user accounts while preserving real ones
DELETE FROM "users" 
WHERE email LIKE '%example%' 
   OR email LIKE '%test%' 
   OR email LIKE '%demo%';

-- Reset sequences
ALTER SEQUENCE flagged_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE fraud_rules_id_seq RESTART WITH 1;
```

5. Click "Run" to execute the SQL commands

**Important Notes:**
- This will permanently delete all sample data
- Real user accounts will be preserved
- All transaction history will be cleared
- All fraud rules will be cleared
- Make sure you have backed up any important data before running these commands

After running these commands, your database will be clean and ready for real use. You can now:
1. Create new fraud rules through the dashboard
2. Process real transactions
3. Monitor for fraud alerts with real data
