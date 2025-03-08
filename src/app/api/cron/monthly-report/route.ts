import { generateFinancialInsights, getMonthlyStats } from "@/lib/inngest/function";
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
		const users = await db.user.findMany({
			include: { accounts: true },
		});
		const response =NextResponse.json({ message: "Financial Reports Send Successfully", processed: users.length });



setTimeout(async() => {
	try {
		for (const user of users) {
			const lastMonth = new Date();
			lastMonth.setMonth(lastMonth.getMonth() - 1);

			const stats = await getMonthlyStats(user.id, lastMonth);
			const monthName = lastMonth.toLocaleString("default", {
				month: "long",
			});

			// Generate AI insights
			const insights = await generateFinancialInsights(stats, monthName);

			const mailData = await EmailTemplate({
				userName: user.name || '',
				type: "monthly-report",
				data: {
					stats,
					month: monthName,
					insights,
				},
			})


			await sendEmail({
				to: user.email,
				subject: `Your Monthly Financial Report - ${monthName}`,
				react:mailData ,
			});
		};
        console.log("Financial Reports Send Successfully. Total Users: ", users.length);

	} catch (error) {
		console.error("Error sending financial report in background:", error);

	}
}, 0);
		

		return response

	} catch (error) {
		console.error("Error in monthly report api:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}