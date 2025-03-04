import { calculateNextRecurringDate, TransactionInterval } from "@/lib/inngest/function";
import { db } from "@/lib/prisma";
import { RecurringInterval } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Fetch all due recurring transactions
    const recurringTransactions = await db.transaction.findMany({
      where: {
        isRecurring: true,
        status: "COMPLETED",
        OR: [
          { lastProcessed: null },
          {
            nextRecurringDate: {
              lte: new Date(),
            },
          },
        ],
      },
      include: {
        account: true,
      },
    });

    if (recurringTransactions.length === 0) {
      return NextResponse.json({ message: "No transactions to process" });
    }

    // Process each transaction
    for (const transaction of recurringTransactions) {
      await db.$transaction(async (tx) => {
        // Create a new transaction record
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

        // Update transaction's last processed and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval as TransactionInterval
            ),
          },
        });
      });
    }

    return NextResponse.json({
      message: "Recurring transactions processed successfully",
      count: recurringTransactions.length,
    });
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to process recurring transactions" },
      { status: 500 }
    );
  }
}
