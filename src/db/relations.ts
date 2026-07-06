import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export default defineRelations(schema, (r) => ({
  expenses: {
    payments: r.many.payments(),
  },
  payments: {
    expense: r.one.expenses({
      from: r.payments.expenseId,
      to: r.expenses.id,
    }),
  },
}));
