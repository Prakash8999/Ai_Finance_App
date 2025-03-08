import { db } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendEmail } from "../../../../../actions/send-email";
import EmailTemplate from "../../../../../emails/template";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send response instantly so the request doesn't time out
    const response = new Response(JSON.stringify({ message: "Budget check started" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Run in background without being killed by Vercel
    (async () => {
      try {
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
            const mailData = await EmailTemplate({
              userName: budget.user.name!,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseFloat(budgetAmount.toFixed(1)),
                totalExpenses: parseFloat(totalExpenses.toFixed(1)),
                accountName: defaultAccount.name,
              },
            });

            await sendEmail({
              to: budget.user.email,
              subject: `Budget Alert for ${defaultAccount.name}`,
              react: mailData,
            });

            // Update last alert sent
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
          }
        }

        console.log("Budget check completed successfully.");
      } catch (error) {
        console.error("Error running budget check in background:", error);
      }
    })();

    return response;
  } catch (error) {
    console.error("Error initializing budget check:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
