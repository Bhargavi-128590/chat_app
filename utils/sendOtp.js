const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtp = async (email, otp) => {
  try {

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
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