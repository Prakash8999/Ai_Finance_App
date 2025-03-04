import { calculateNextRecurringDate, TransactionInterval } from "@/lib/inngest/function";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Fetch all due recurring transactions
    const transactions = await db.transaction.findMany({
      where: {
        isRecurring: true,
        nextRecurringDate: { lte: new Date() }, // Process due transactions
      },
      include: { account: true },
    });

    if (!transactions.length) {
      return NextResponse.json({ message: "No recurring transactions to process" });
    }

    for (const transaction of transactions) {
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and set next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval as TransactionInterval // Adjust type if needed
            ),
          },
        });
      });
    }

    return NextResponse.json({ message: "Recurring transactions processed successfully" });
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
