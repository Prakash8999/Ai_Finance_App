import { generateFinancialInsights, getMonthlyStats } from "@/lib/inngest/function";
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

    const users = await db.user.findMany({ include: { accounts: true } });

    // Send response immediately to avoid timeout issues
    const response = new Response(JSON.stringify({ message: "Financial Reports Sending in Background", processed: users.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Run email processing in background
    (async () => {
      try {
        for (const user of users) {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);

          const stats = await getMonthlyStats(user.id, lastMonth);
          const monthName = lastMonth.toLocaleString("default", { month: "long" });

          // Generate AI insights
          const insights = await generateFinancialInsights(stats, monthName);

          const mailData = await EmailTemplate({
            userName: user.name || '',
            type: "monthly-report",
            data: { stats, month: monthName, insights },
          });

          await sendEmail({
            to: user.email,
            subject: `Your Monthly Financial Report - ${monthName}`,
            react: mailData,
          });
        }

        console.log("Financial Reports Sent Successfully. Total Users:", users.length);
      } catch (error) {
        console.error("Error sending financial reports in background:", error);
      }
    })();

    return response;
  } catch (error) {
    console.error("Error in monthly report API:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
