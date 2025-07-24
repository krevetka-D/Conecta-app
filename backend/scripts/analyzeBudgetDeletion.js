import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log(`
=== Budget Deletion Flow Analysis ===

This script analyzes the budget deletion flow for potential race conditions.

Key findings from code review:

1. **Deletion Flow (budgetController.js lines 192-218):**
   - First checks if entry exists with findById()
   - Then checks ownership
   - Finally deletes with findByIdAndDelete()
   
2. **Potential Race Condition:**
   - Between the existence check (line 193) and deletion (line 206)
   - If two deletion requests arrive simultaneously:
     * Request A: Checks entry exists ✓
     * Request B: Checks entry exists ✓
     * Request A: Deletes entry ✓
     * Request B: Tries to delete → Entry not found ❌

3. **Missing Safeguards:**
   - No transaction or atomic operation
   - No idempotency check
   - Separate read and delete operations

4. **Real-time Events:**
   - emitBudgetDelete() is called after deletion
   - If deletion fails, event is not emitted
   - No rollback mechanism

5. **Cache Clearing:**
   - Cache is cleared even if deletion might fail
   - Could lead to inconsistent state

RECOMMENDATIONS:

1. **Use findOneAndDelete() for atomic operation:**
   const deletedEntry = await BudgetEntry.findOneAndDelete({
       _id: req.params.id,
       user: req.user._id  // Ownership check in query
   });
   
   if (!deletedEntry) {
       // Could be not found OR not authorized
       const exists = await BudgetEntry.exists({ _id: req.params.id });
       if (exists) {
           throw new Error('Not authorized');
       } else {
           throw new Error('Budget entry not found');
       }
   }

2. **Add idempotency:**
   - Return success even if entry already deleted
   - Check if the error is "not found" and handle gracefully

3. **Add request deduplication:**
   - Use a cache or lock mechanism to prevent duplicate deletions
   - Example: Redis SET with NX and EX flags

4. **Improve error handling:**
   - Distinguish between "not found" and "already deleted"
   - Log deletion attempts for debugging

The error with ID 68801df9880b6c29c31470b5 was likely caused by:
- Multiple simultaneous deletion requests
- The entry was deleted by the first request
- Subsequent requests failed with "not found"
`);