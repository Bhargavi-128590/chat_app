const transporter = require("../config/mail");

exports.sendOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Your App" <bhargavithippareddy12@gmail.com>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="color:blue;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("OTP email sent");
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send OTP");
  }
};