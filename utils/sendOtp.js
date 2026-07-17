const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

exports.sendOtp = async (email, otp) => {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Invalid recipient email");
    }

    const recipient = email.trim();

    console.log(`Sending OTP from ${fromEmail} to ${recipient}`);

    await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="color:blue;">${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    console.log("OTP email sent");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send OTP");
  }
};
