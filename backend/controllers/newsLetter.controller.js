import NewsLetter from "../models/newsletter.model.js";
import { sendWelcomeEmail } from "../utils/sendEmail.js";

export const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;
  console.log("email:", email);
  try {
    // Check if the email is already subscribed
    const existingSubscriber = await NewsLetter.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ message: "You are already subscribed." });
    }

    // Add new subscriber
    const subscriber = new NewsLetter({ email, subscribedAt: new Date() });
    await subscriber.save();

    await sendWelcomeEmail(email); // Send welcome email to new subscriber

    res
      .status(200)
      .json({ message: "Subscription successful! Thank you for subscribing." });
  } catch (error) {
    console.error("Error in subscribing to newsletter:", error);
    res.status(500).json({
      message: "Failed to subscribe. Please try again later.",
    });
  }
};
