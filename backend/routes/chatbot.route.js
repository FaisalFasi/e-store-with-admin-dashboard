import express from "express";
import axios from "axios";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Get the API key from environment variable
});

router.post("/", async (req, res) => {
  const userMessage = req.body.message;
  console.log("userMessage: ", userMessage);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Correct model name
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });
    console.log("response: ", response);
    const botMessage = response.choices[0].message.content;
    console.log("botMessage: ", botMessage);
    res.status(200).json({ botMessage });
  } catch (error) {
    console.log("Error in OPENAI endpoint router: ", error);
    res.status(500).json({ error: "Failed to get a response from OpenAI" });
  }
});

export default router;
