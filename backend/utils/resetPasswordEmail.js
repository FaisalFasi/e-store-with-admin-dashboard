import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`; // Replace localhost with your frontend domain in production

  const dynamicMsg = {
    to: email,
    from: { name: "FR_Store", email: process.env.FROM_EMAIL },
    templateId: process.env.SENDGRID_TEMPLATE_ID, // Use your dynamic template ID here
    dynamicTemplateData: {
      name: "FR_Store",
      resetLink: resetLink, // Add the reset link to your email template
    },
  };

  try {
    await sgMail.send(dynamicMsg);
    console.log("Reset password email sent to:", email);
  } catch (error) {
    console.error("Error sending reset email:", error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

export default sendResetPasswordEmail;

// Generate reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// // for dynamic email
// const dynamicMsg = {
//   to: ["faisalfasi.fasi18@gmail.com"], // Change to your recipient
//   from: { name: "FR_Store", email: process.env.FROM_EMAIL }, // Use the email address or domain you verified above
//   templateId: process.env.SENDGRID_TEMPLATE_ID,
//   dynamicTemplateData: {
//     name: "FR_Store",
//   },
// };
// // sendDynamicEmail function to send dynamic emails
// const sendDynamicEmail = async (dynamicMsg) => {
//   try {
//     await sgMail.send(dynamicMsg);
//     console.log("Email sent", dynamicMsg);
//   } catch (error) {
//     console.error(error);

//     if (error.response) {
//       console.error(error.response.body);
//     }
//   }
// };
