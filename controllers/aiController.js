const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate event description using OpenAI
const generateDescription = async (req, res, next) => {
  try {
    const { title, location, date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Event title is required" });
    }

    const prompt = `Generate a compelling and detailed event description for an event titled "${title}"${location ? ` taking place at ${location}` : ""}${date ? ` on ${date}` : ""}. The description should be engaging, informative, and highlight what attendees can expect. Make it 2-3 sentences long.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
    });

    const generatedDescription =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!generatedDescription) {
      return res.status(500).json({ error: "Failed to generate description" });
    }

    res.json({ description: generatedDescription });
  } catch (error) {
    console.error("Error generating description:", error);
    next(error);
  }
};

// Generate image prompt using OpenAI, then generate image using Gemini

const generateImage = async (req, res, next) => {
  try {
    const { title, location, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Event title is required" });
    }

    // First, generate the image prompt using OpenAI
    const promptForImage = `Generate a detailed image generation prompt for an event titled "${title}"${location ? ` at ${location}` : ""}${description ? `. Event description: ${description}` : ""}. The prompt should be suitable for an AI image generator and describe a visually appealing, professional event image. Make it specific and detailed, focusing on the atmosphere, setting, and key visual elements. Return only the prompt, no additional text.`;

    let imagePrompt;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: promptForImage,
          },
        ],
        max_tokens: 150,
      });

      imagePrompt = completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error generating image prompt:", error);
      return res
        .status(500)
        .json({ error: "Failed to generate image prompt" });
    }

    if (!imagePrompt) {
      return res.status(500).json({ error: "Failed to generate image prompt" });
    }

    // Try to generate image using Gemini API
    try {
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const geminiResponse = await fetch(geminiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: imagePrompt,
                },
              ],
            },
          ],
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
      }

      const geminiData = await geminiResponse.json();

      // Check if response contains image data
      if (
        geminiData.candidates &&
        geminiData.candidates[0]?.content?.parts
      ) {
        const parts = geminiData.candidates[0].content.parts;
        const imagePart = parts.find((part) => part.inlineData);

        if (imagePart?.inlineData?.data) {
          // Save image to filesystem
          const timestamp = Date.now();
          const filename = `event-${timestamp}.png`;
          const imagePath = path.join(__dirname, '../images', filename);
          
          // Convert base64 to buffer and save
          const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
          fs.writeFileSync(imagePath, imageBuffer);
          
          // Convert base64 to data URL for immediate display
          const imageDataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          
          return res.json({ 
            image: imageDataUrl,
            imagePath: `/api/images/${filename}`
          });
        }
      }

      // Fallback to OpenAI DALL-E if Gemini doesn't return image
      console.log(
        "Gemini response didn't contain image, trying OpenAI DALL-E as fallback"
      );
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = imageResponse.data[0]?.url;
      if (imageUrl) {
        // Download and save image
        const timestamp = Date.now();
        const filename = `event-${timestamp}.png`;
        const imagePath = path.join(__dirname, '../images', filename);
        
        await downloadImage(imageUrl, imagePath);
        
        return res.json({ 
          image: imageUrl,
          imagePath: `/api/images/${filename}`
        });
      } else {
        return res.status(500).json({ error: "Failed to generate image" });
      }
    } catch (geminiError) {
      console.error("Gemini image generation error:", geminiError);
      // Fallback to OpenAI DALL-E
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
        });

        const imageUrl = imageResponse.data[0]?.url;
        if (imageUrl) {
          // Download and save image
          const timestamp = Date.now();
          const filename = `event-${timestamp}.png`;
          const imagePath = path.join(__dirname, '../images', filename);
          
          await downloadImage(imageUrl, imagePath);
          
          return res.json({ 
            image: imageUrl,
            imagePath: `/api/images/${filename}`
          });
        } else {
          return res.status(500).json({ error: "Failed to generate image" });
        }
      } catch (openaiError) {
        console.error("OpenAI fallback error:", openaiError);
        return res
          .status(500)
          .json({ error: "Error generating image. Please try again." });
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    next(error);
  }
};

// Helper function to download image from URL
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = {
  generateDescription,
  generateImage,
};

