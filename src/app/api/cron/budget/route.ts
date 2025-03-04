import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../../actions/send-email";
import EmailTemplate from "../../../../../emails/template";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const budgets = await db.budget.findMany({
      include: {
        user: { include: { accounts: { where: { isDefault: true } } } },
      },
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      const startDate = new Date();
      startDate.setDate(1); // Start of current month

      const expenses = await db.transaction.aggregate({
        where: {
          userId: budget.userId,
          accountId: defaultAccount.id,
          type: "EXPENSE",
          date: { gte: startDate },
        },
        _sum: { amount: true },
      });

      const totalExpenses = expenses._sum.amount?.toNumber() || 0;
      const budgetAmount = Number(budget.amount);
      const percentageUsed = (totalExpenses / budgetAmount) * 100;

      if (percentageUsed >= 80) {
        await sendEmail({
					to: budget.user.email,
					subject: `Budget Alert for ${defaultAccount.name}`,
					react: EmailTemplate({
					  userName: budget.user.name!,
					  type: "budget-alert",
					  data: {
						percentageUsed,
						budgetAmount: parseFloat(budgetAmount.toFixed(1)), // Convert back to number
						totalExpenses: parseFloat(totalExpenses.toFixed(1)),
						accountName: defaultAccount.name,
					  },
					}),
				  });
		
				  // Update last alert sent
				  await db.budget.update({
					where: { id: budget.id },
					data: { lastAlertSent: new Date() },
				  });
      }
    }

    return NextResponse.json({ message: "Budget check completed" });
  } catch (error) {
    console.error("Error running budget check:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
