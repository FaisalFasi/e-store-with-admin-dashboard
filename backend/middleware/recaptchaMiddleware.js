import axios from "axios";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";

dotenv.config();

let storedCaptchaToken = ""; // Variable to store the received token
let tokenExpirationTime = 2 * 60 * 1000; // 2 minutes in milliseconds
// Function to clear the stored token after expiration
const clearStoredToken = () => {
  setTimeout(() => {
    storedCaptchaToken = "";
  }, tokenExpirationTime);
};

const verifyCaptcha = asyncHandler(async (req, res, next) => {
  const { captcha } = req.body;

  console.log("captcha on BE :", captcha);
  if (!captcha) {
    return res.status(400).json({ message: "Captcha is required" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    // const response = await axios.post(url);
    const response = await axios.post(url);
    if (!storedCaptchaToken) {
    }
    if (response.data.success && !storedCaptchaToken) {
      console.log("Captcha verified");
      storedCaptchaToken = captcha;
      return next();
    } else if (storedCaptchaToken) {
      return next();
    } else {
      return res.status(400).json({ error: "Captcha verification failed" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Captcha verification failed" });
  }
});

// Set the initial expiration timer
clearStoredToken();
export { verifyCaptcha };
