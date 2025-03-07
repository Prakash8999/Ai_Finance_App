"use server";

import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  react, // JSX component props
}: { 
  to: string; 
  subject: string; 
  react: any; 
}) {
  // ✅ Convert JSX to HTML (await it!)

  const transporter = nodemailer.createTransport({
    service: "gmail", // Change if using a different provider
    auth: {
      user: process.env.NODEMAILER_EMAIL_FROM, // Your email
      pass: process.env.NODEMAILER_EMAIL_PASSWORD, // Your passkey (App password)
    },
  });

  try {
    const data = await transporter.sendMail({
      from: `"Finance App" <${process.env.NODEMAILER_EMAIL_FROM}>`,
      to,
      subject,
      html: react, // ✅ Use converted HTML, NOT react
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
