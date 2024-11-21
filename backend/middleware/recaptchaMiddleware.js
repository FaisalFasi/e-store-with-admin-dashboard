import axios from "axios";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";

dotenv.config();

const verifyCaptcha = asyncHandler(async (req, res, next) => {
  const { captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ message: "Captcha is required" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const response = await axios.post(url);

    if (response.data.success) {
      return next();
    } else {
      return res.status(400).json({ error: "Captcha verification failed" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Captcha verification failed" });
  }
});

export { verifyCaptcha };
