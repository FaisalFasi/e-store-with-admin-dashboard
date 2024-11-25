// import express from "express";
// import dialogflow from "dialogflow";

// const { SessionsClient } = dialogflow;
// import path from "path";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// // Load environment variables
// const projectId = process.env.DIALOGFLOW_PROJECT_ID;
// const keyFile = path.resolve("../config/dialogflow-key.json");
// // const keyFile = process.env.DIALOGFLOW_KEY_FILE;

// // Create a Dialogflow client
// const sessionClient = new SessionsClient({ keyFilename: keyFile });

// // POST endpoint to send user messages to Dialogflow
// router.post("/", async (req, res) => {
//   const { message, sessionId } = req.body;
//   console.log("message: ", message);
//   console.log("sessionId: ", sessionId);

//   if (!message || !sessionId) {
//     return res
//       .status(400)
//       .json({ error: "Message and sessionId are required" });
//   }

//   const sessionPath = sessionClient.sessionPath(projectId, sessionId);

//   const request = {
//     session: sessionPath,
//     queryInput: {
//       text: {
//         text: message,
//         languageCode: "en", // Change this based on your Dialogflow agent's language
//       },
//     },
//   };

//   try {
//     const responses = await sessionClient.detectIntent(request);
//     const result = responses[0].queryResult;
//     console.log("result: ", result);
//     res.json({ reply: result.fulfillmentText });
//   } catch (error) {
//     console.error("Dialogflow API Error:", error);
//     res.status(500).json({ error: "Failed to connect to Dialogflow" });
//   }
// });

// export default router;

/*
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // Store your Hugging Face API key in .env

router.post("/", async (req, res) => {
  const userMessage = req.body.message;
  console.log("userMessage: ", userMessage);

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
        },
      }
    );
    console.log("response: ", response.data);
    res.json({ botMessage: response.data[0]?.generated_text });
  } catch (error) {
    console.error("Error in chatbot API:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get a response from the chatbot." });
  }
});

export default router;*/

// OPENAI API implementation
/*import express from "express";
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
*/
