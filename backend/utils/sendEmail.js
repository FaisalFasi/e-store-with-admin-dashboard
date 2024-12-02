import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import dotenv from "dotenv";
import NewsLetter from "../models/newsletter.model.js";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`; // Replace localhost with your frontend domain in production

  const dynamicMsg = {
    to: email,
    from: { name: "FR_Store", email: process.env.FROM_EMAIL },
    templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID, // Use your dynamic template ID here
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

// Generate reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
export const sendWelcomeEmail = async (toEmail) => {
  const msg = {
    to: toEmail,
    from: process.env.FROM_EMAIL, // Sender email
    templateId: process.env.SENDGRID_SUBSCRIBER_TEMPLATE_ID, // Use your dynamic template ID here
    // dynamicTemplateData: {
    //   name: "FR_Store",
    //   resetLink: resetLink, // Add the reset link to your email template
    // },
  };

  try {
    await sgMail.send(msg);
    console.log("Welcome email sent to:", toEmail);
  } catch (error) {
    console.error("Error sending welcome email:", error.response.body);
    throw new Error("Failed to send welcome email");
  }
};

export const sendNewsletter = async () => {
  const subscribers = await NewsLetter.find();

  const emails = subscribers.map((sub) => sub.email);

  const msg = {
    to: emails,
    from: "faisalfasi18@gmail.com",
    subject: "Our Latest Updates",
    text: "Here's what's new...",
    html: "<strong>Here's what's new...</strong>",
  };

  await sgMail.sendMultiple(msg);
};
