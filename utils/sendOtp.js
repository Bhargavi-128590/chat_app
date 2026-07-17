const { Resend } = require("resend");
const { sendMail } = require("../config/mail");

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

function formatResendError(error, recipient, fromEmail) {
  const message = error?.message || String(error);

  if (
    message.includes("You can only send testing emails") ||
    message.includes("verify a domain")
  ) {
    return `Resend error: ${message}. To send OTPs to other recipients, verify a domain in Resend and set RESEND_FROM_EMAIL to an email from that domain, or configure SMTP as a fallback.`;
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
    const formatted = formatResendError(error, recipient, fromEmail);
    console.error("Resend send failed:", formatted);
    throw new Error(formatted);
  }
}

async function sendWithSmtp(recipient, otp) {
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  console.log(`Sending OTP from ${fromEmail} to ${recipient} via SMTP`);

  await sendMail({
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

  console.log("OTP email sent via SMTP");
}

exports.sendOtp = async (email, otp) => {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Invalid recipient email");
    }

    const recipient = email.trim();

    if (process.env.RESEND_API_KEY) {
      try {
        await sendWithResend(recipient, otp);
        return;
      } catch (resendError) {
        if (
          !process.env.SMTP_HOST ||
          !process.env.SMTP_USER ||
          !process.env.SMTP_PASS
        ) {
          throw resendError;
        }

        console.warn(
          "Resend failed, trying SMTP fallback:",
          resendError.message || resendError,
        );
      }
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      await sendWithSmtp(recipient, otp);
      return;
    }

    throw new Error(
      "No mail provider is configured. Set RESEND_API_KEY/RESEND_FROM_EMAIL or SMTP_HOST/SMTP_USER/SMTP_PASS.",
    );
  } catch (error) {
    console.error("OTP send failed:", error.message || error);
    throw new Error(error.message || "Failed to send OTP");
  }
};
