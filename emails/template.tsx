"use server";

interface MonthlyReportData {
  month: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    byCategory?: Record<string, number>;
  };
  insights?: string[];
}

interface BudgetAlertData {
  percentageUsed: number;
  budgetAmount: number;
  totalExpenses: number;
  accountName: string;
}

interface EmailTemplateProps {
  userName: string;
  type: "monthly-report" | "budget-alert";
  data: MonthlyReportData | BudgetAlertData;
}

export default async function renderEmail(props: EmailTemplateProps): Promise<string> {
  const { userName, type, data } = props;

  if (type === "monthly-report") {
    const reportData = data as MonthlyReportData;
    const totalIncome = reportData.stats.totalIncome.toFixed(2);
    const totalExpenses = reportData.stats.totalExpenses.toFixed(2);
    const netAmount = (reportData.stats.totalIncome - reportData.stats.totalExpenses).toFixed(2);
    
    return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007bff; text-align: center;">Monthly Financial Report</h2>
          <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">Here’s your financial summary for ${reportData.month}:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Total Income:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${totalIncome}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Total Expenses:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${totalExpenses}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Net:</strong></td>
              <td style="padding: 10px; text-align: right;">$${netAmount}</td>
            </tr>
          </table>

          ${reportData.stats.byCategory ? `
          <h3 style="margin-top: 20px;">Expenses by Category</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(reportData.stats.byCategory)
              .map(([category, amount]) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${category}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${amount.toFixed(2)}</td>
                </tr>
              `)
              .join('')}
          </table>` : ''}

          ${reportData.insights ? `
          <h3 style="margin-top: 20px;">Wealix Insights</h3>
          <ul>
            ${reportData.insights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>` : ''}

          <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
            Thank you for using Wealix. Keep tracking your finances for better financial health!
          </p>
        </div>
      </body>
    </html>`;
  }

  if (type === "budget-alert") {
    const budgetData = data as BudgetAlertData;
    const budgetAmount = budgetData.budgetAmount.toFixed(2);
    const totalExpenses = budgetData.totalExpenses.toFixed(2);
    const percentageUsed = budgetData.percentageUsed.toFixed(2);
    
    return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #ff0000; text-align: center;">Budget Alert for ${budgetData.accountName}</h2>
          <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">Your budget report:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Budget Amount:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${budgetAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Total Expenses:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${totalExpenses}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Percentage Used:</strong></td>
              <td style="padding: 10px; text-align: right;">${percentageUsed}%</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
            Please monitor your spending to stay within your budget.
          </p>
        </div>
      </body>
    </html>`;
  }
  
  return "";
}
