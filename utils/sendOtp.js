const { Resend } = require("resend");

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

function formatResendError(error) {
  const message = String(error?.message || error || "")
    .trim()
    .replace(/[.]+$/g, "");

  if (
    message.includes("You can only send testing emails") ||
    message.includes("verify a domain")
  ) {
    return `Resend error: ${message}. To send OTPs to other recipients, verify a domain in Resend and set RESEND_FROM_EMAIL to an email from that domain.`;
  }

  return message;
}

async function sendWithResend(recipient, otp) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured. Set a verified sender email for Resend.",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
    throw new Error(
      `RESEND_FROM_EMAIL must be a full email address like 'no-reply@yourdomain.com'. Current value: ${fromEmail}`,
    );
  }

  const resend = getResendClient();

  console.log(`Sending OTP from ${fromEmail} to ${recipient} via Resend`);

  try {
    const response = await resend.emails.send({
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

    if (response?.error) {
      throw new Error(response.error.message || "Resend returned an error");
    }

    console.log(
      "OTP email sent via Resend",
      response?.data?.id || response?.id || "no-id",
    );
  } catch (error) {
    const formatted = formatResendError(error);
    console.error("Resend send failed:", formatted);
    throw new Error(formatted);
  }
}

exports.sendOtp = async (email, otp) => {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Invalid recipient email");
    }

    const recipient = email.trim();

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    await sendWithResend(recipient, otp);
  } catch (error) {
    console.error("OTP send failed:", error.message || error);
    throw new Error(error.message || "Failed to send OTP");
  }
};
